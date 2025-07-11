import os
import logging
from datetime import datetime
from flask import Flask, Blueprint, render_template, request, flash, redirect, url_for, jsonify
from werkzeug.utils import secure_filename
import fitz  # PyMuPDF
from transformers import pipeline
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import WordNetLemmatizer
from textstat import flesch_kincaid_grade, flesch_reading_ease, automated_readability_index
import spacy
from collections import Counter
import matplotlib
matplotlib.use('Agg')  # Use non-interactive Agg backend
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from wordcloud import WordCloud
from flask_cors import CORS


# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Download required NLTK data
print("Initializing NLTK data...")
try:
    nltk.download('punkt', quiet=True)
    nltk.download('punkt_tab', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    nltk.download('vader_lexicon', quiet=True)
    nltk.download('brown', quiet=True)
    logger.info("NLTK data downloaded successfully")
except Exception as e:
    logger.error(f"Failed to download NLTK data: {e}")
    try:
        nltk.download(['punkt', 'punkt_tab', 'stopwords', 'wordnet', 'averaged_perceptron_tagger', 'vader_lexicon', 'brown'])
        logger.info("Successfully downloaded missing NLTK resources")
    except Exception as e2:
        logger.error(f"Failed to download NLTK resources after retry: {e2}")
        raise Exception("Critical NLTK resources missing. Please run `nltk.download(['punkt', 'punkt_tab', 'stopwords', 'wordnet', 'averaged_perceptron_tagger', 'vader_lexicon', 'brown'])` manually.")

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'txt', 'docx'}

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('static/plots', exist_ok=True)

# Global variables for models
models = {
    'sentence_transformer': None,
    'sentiment_analyzer': None,
    'text_classifier': None,
    'question_answering': None,
    'summarizer': None,
    'nlp': None,
    'lemmatizer': None,
    'stopwords': None
}

class AssignmentAnalyzer:
    def __init__(self):
        self.models = models
        self.load_models()
        
    def load_models(self):
        """Load all required models"""
        print("Loading AI models...")
        try:
            self.models['sentence_transformer'] = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Sentence transformer loaded")
            
            self.models['sentiment_analyzer'] = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                tokenizer="cardiffnlp/twitter-roberta-base-sentiment-latest",
                model_kwargs={"use_safetensors": False}
            )
            logger.info("Sentiment analyzer loaded")
            
            self.models['text_classifier'] = pipeline(
                "text-classification",
                model="distilbert-base-uncased-finetuned-sst-2-english"
            )
            logger.info("Text classifier loaded")
            
            self.models['question_answering'] = pipeline(
                "question-answering",
                model="distilbert-base-cased-distilled-squad"
            )
            logger.info("Question answering model loaded")
            
            self.models['summarizer'] = pipeline(
                "summarization",
                model="facebook/bart-large-cnn"
            )
            logger.info("Summarizer loaded")
            
            try:
                self.models['nlp'] = spacy.load("en_core_web_sm")
                logger.info("spaCy model loaded")
            except Exception as e:
                logger.warning(f"spaCy model not available: {e}")
                self.models['nlp'] = None
            
            self.models['lemmatizer'] = WordNetLemmatizer()
            self.models['stopwords'] = set(stopwords.words('english'))
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            print(f"Error loading models: {e}")

analyzer = AssignmentAnalyzer()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def extract_text_from_file(filepath):
    """Extract text from various file formats"""
    _, ext = os.path.splitext(filepath)
    ext = ext.lower()
    
    try:
        if ext == '.pdf':
            return extract_text_from_pdf(filepath)
        elif ext == '.txt':
            with open(filepath, 'r', encoding='utf-8') as f:
                text = f.read()
                logger.info(f"Extracted {len(text)} characters from TXT file: {filepath}")
                return text
        elif ext == '.docx':
            try:
                import docx
                doc = docx.Document(filepath)
                text = '\n'.join([paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()])
                logger.info(f"Extracted {len(text)} characters from DOCX file: {filepath}")
                return text
            except ImportError:
                logger.error("python-docx not installed")
                return ""
        else:
            logger.error(f"Unsupported file extension: {ext}")
            return ""
    except Exception as e:
        logger.error(f"Error extracting text from {filepath}: {e}")
        return ""

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file"""
    text = ""
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                page_text = page.get_text()
                if page_text.strip():
                    text += page_text + "\n"
        logger.info(f"Extracted {len(text)} characters from PDF: {pdf_path}")
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        return ""

def preprocess_text(text):
    """Advanced text preprocessing"""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text).strip()
    text = re.sub(r'[^\w\s\.\!\?\,\;\:\-\(\)\"\']', '', text)
    text = re.sub(r'\b([a-z])([A-Z])', r'\1 \2', text)
    text = re.sub(r'\btriad\b', 'triad_word', text, flags=re.IGNORECASE)
    logger.info(f"Preprocessed text length: {len(text)}")
    return text

def analyze_writing_style(text):
    """Analyze writing style and quality"""
    if not text.strip():
        logger.warning("Empty text in analyze_writing_style")
        return {}
    
    sentences = sent_tokenize(text)
    words = word_tokenize(text.lower())
    content_words = [word for word in words if word.isalnum() and word not in analyzer.models['stopwords']]
    
    style_metrics = {
        'avg_sentence_length': np.mean([len(word_tokenize(s)) for s in sentences]) if sentences else 0,
        'sentence_length_variance': np.var([len(word_tokenize(s)) for s in sentences]) if sentences else 0,
        'lexical_diversity': len(set(content_words)) / len(content_words) if content_words else 0,
        'word_frequency_distribution': Counter(content_words).most_common(10),
        'complex_words': len([w for w in content_words if len(w) > 6]),
        'simple_words': len([w for w in content_words if len(w) <= 6]),
        'paragraph_count': len([p for p in text.split('\n\n') if p.strip()]),
        'transition_words': count_transition_words(text),
        'passive_voice_count': count_passive_voice(text),
        'question_count': text.count('?'),
        'exclamation_count': text.count('!')
    }
    
    logger.info(f"Writing style metrics: {style_metrics}")
    return style_metrics

def count_transition_words(text):
    """Count transition words in text"""
    transition_words = [
        'however', 'therefore', 'furthermore', 'moreover', 'additionally',
        'consequently', 'nevertheless', 'nonetheless', 'meanwhile', 'subsequently',
        'similarly', 'likewise', 'conversely', 'alternatively', 'specifically',
        'particularly', 'especially', 'notably', 'importantly', 'significantly'
    ]
    text_lower = text.lower()
    count = sum(1 for word in transition_words if word in text_lower)
    logger.info(f"Transition words count: {count}")
    return count

def count_passive_voice(text):
    """Count passive voice instances"""
    if not analyzer.models['nlp']:
        logger.warning("spaCy model not available for passive voice analysis")
        return 0
    
    doc = analyzer.models['nlp'](text)
    passive_count = sum(1 for sent in doc.sents for token in sent if token.dep_ == "nsubjpass")
    logger.info(f"Passive voice count: {passive_count}")
    return passive_count

def analyze_semantic_content(text, criteria):
    """Analyze semantic content using sentence transformers"""
    if not analyzer.models['sentence_transformer'] or not text.strip() or not criteria:
        logger.warning(f"Semantic analysis skipped: model={analyzer.models['sentence_transformer'] is not None}, text={bool(text.strip())}, criteria={bool(criteria)}")
        return {}
    
    try:
        sentences = sent_tokenize(text)
        if not sentences:
            logger.warning("No sentences found in text")
            return {}
        
        sentence_embeddings = analyzer.models['sentence_transformer'].encode(sentences)
        criteria_embeddings = analyzer.models['sentence_transformer'].encode(criteria)
        logger.info(f"Sentence embeddings shape: {sentence_embeddings.shape}")
        logger.info(f"Criteria embeddings shape: {criteria_embeddings.shape}")
        
        semantic_analysis = {}
        for i, criterion in enumerate(criteria):
            similarities = cosine_similarity([criteria_embeddings[i]], sentence_embeddings)[0]
            top_indices = np.argsort(similarities)[-3:][::-1]
            relevant_sentences = [sentences[idx] for idx in top_indices if similarities[idx] > 0.3]
            
            semantic_analysis[criterion] = {
                'max_similarity': float(np.max(similarities)),
                'avg_similarity': float(np.mean(similarities)),
                'relevant_sentences': relevant_sentences[:2],
                'coverage_score': float(np.max(similarities))
            }
        
        logger.info(f"Semantic analysis: {semantic_analysis}")
        return semantic_analysis
    except Exception as e:
        logger.error(f"Error in analyze_semantic_content: {str(e)}")
        return {}

def analyze_sentiment_and_tone(text):
    """Analyze sentiment and tone of the text"""
    if not analyzer.models['sentiment_analyzer']:
        logger.warning("Sentiment analyzer not loaded")
        return {}
    
    chunks = [text[i:i+500] for i in range(0, len(text), 500)]
    sentiments = []
    
    for chunk in chunks:
        if chunk.strip():
            try:
                result = analyzer.models['sentiment_analyzer'](chunk)
                sentiments.append(result[0])
            except Exception as e:
                logger.warning(f"Sentiment analysis failed for chunk: {e}")
                continue
    
    if not sentiments:
        logger.warning("No valid sentiment analysis results")
        return {}
    
    sentiment_scores = {
        'positive': sum(1 for s in sentiments if s['label'].lower() == 'positive'),
        'neutral': sum(1 for s in sentiments if s['label'].lower() == 'neutral'),
        'negative': sum(1 for s in sentiments if s['label'].lower() == 'negative')
    }
    
    total_chunks = len(sentiments)
    sentiment_distribution = {
        'positive_ratio': sentiment_scores['positive'] / total_chunks if total_chunks else 0,
        'neutral_ratio': sentiment_scores['neutral'] / total_chunks if total_chunks else 0,
        'negative_ratio': sentiment_scores['negative'] / total_chunks if total_chunks else 0,
        'overall_tone': max(sentiment_scores, key=sentiment_scores.get)
    }
    
    logger.info(f"Sentiment analysis: {sentiment_distribution}")
    return sentiment_distribution

def generate_comprehensive_feedback(text, criteria, quality_metrics, style_metrics, semantic_analysis, sentiment_analysis):
    """Generate comprehensive AI feedback"""
    feedback = {
        'strengths': [],
        'weaknesses': [],
        'suggestions': [],
        'detailed_analysis': {},
        'overall_assessment': ""
    }
    
    if quality_metrics.get('word_count', 0) >= 300:
        feedback['strengths'].append("Good length and depth of content")
    
    if quality_metrics.get('readability_score', 0) > 50:
        feedback['strengths'].append("Clear and readable writing style")
    
    if style_metrics.get('lexical_diversity', 0) > 0.6:
        feedback['strengths'].append("Good vocabulary diversity")
    
    if style_metrics.get('transition_words', 0) > 3:
        feedback['strengths'].append("Good use of transition words for flow")
    
    if quality_metrics.get('avg_sentence_length', 0) > 25:
        feedback['weaknesses'].append("Sentences tend to be too long")
        feedback['suggestions'].append("Consider breaking long sentences into shorter ones")
    
    if style_metrics.get('passive_voice_count', 0) > 5:
        feedback['weaknesses'].append("Overuse of passive voice")
        feedback['suggestions'].append("Use more active voice for stronger writing")
    
    if quality_metrics.get('grade_level', 0) > 12:
        feedback['weaknesses'].append("Writing complexity may be too high")
        feedback['suggestions'].append("Simplify language for better accessibility")
    
    if semantic_analysis:
        well_covered = [c for c, analysis in semantic_analysis.items() if analysis['coverage_score'] > 0.7]
        poorly_covered = [c for c, analysis in semantic_analysis.items() if analysis['coverage_score'] < 0.4]
        
        if well_covered:
            feedback['strengths'].append(f"Well addressed criteria: {', '.join(well_covered[:3])}")
        
        if poorly_covered:
            feedback['weaknesses'].append(f"Needs more attention: {', '.join(poorly_covered[:3])}")
            feedback['suggestions'].append("Provide more detailed coverage of poorly addressed criteria")
    
    if sentiment_analysis:
        if sentiment_analysis.get('negative_ratio', 0) > 0.3:
            feedback['suggestions'].append("Consider adopting a more balanced or positive tone")
        
        if sentiment_analysis.get('positive_ratio', 0) > 0.7:
            feedback['strengths'].append("Maintains a positive and engaging tone")
    
    strength_count = len(feedback['strengths'])
    weakness_count = len(feedback['weaknesses'])
    
    if strength_count > weakness_count:
        feedback['overall_assessment'] = "This is a strong assignment with clear strengths that outweigh the areas for improvement."
    elif weakness_count > strength_count:
        feedback['overall_assessment'] = "This assignment has potential but requires significant improvement in several areas."
    else:
        feedback['overall_assessment'] = "This assignment shows balanced performance with equal strengths and areas for development."
    
    logger.info(f"Feedback generated: {feedback}")
    return feedback

def create_visualizations(quality_metrics, style_metrics, semantic_analysis):
    """Create visualizations for analysis results"""
    plots = {}
    try:
        # Quality metrics bar chart
        fig, ax = plt.subplots(figsize=(8, 6))
        metrics = ['Word Count', 'Readability', 'Grade Level', 'Sentence Length']
        values = [
            min(quality_metrics.get('word_count', 0) / 10, 100),
            quality_metrics.get('readability_score', 0),
            min(quality_metrics.get('grade_level', 0) * 10, 100),
            min(quality_metrics.get('avg_sentence_length', 0) * 4, 100)
        ]
        ax.bar(metrics, values, color=['#ff9999', '#66b3ff', '#99ff99', '#ffcc99'])
        ax.set_title('Text Quality Metrics')
        ax.set_ylabel('Score')
        plt.xticks(rotation=45)
        plt.tight_layout()
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png')
        img_buffer.seek(0)
        plots['quality_metrics'] = base64.b64encode(img_buffer.getvalue()).decode()
        plt.close(fig)

        # Criteria coverage chart
        if semantic_analysis and len(semantic_analysis) > 0:
            fig, ax = plt.subplots(figsize=(10, 6))
            criteria = list(semantic_analysis.keys())[:5]
            scores = [semantic_analysis[c]['coverage_score'] * 100 for c in criteria]
            bars = ax.bar(range(len(criteria)), scores, color='skyblue')
            ax.set_title('Criteria Coverage Analysis')
            ax.set_ylabel('Coverage Score (%)')
            ax.set_xticks(range(len(criteria)))
            ax.set_xticklabels([c[:20] + '...' if len(c) > 20 else c for c in criteria], rotation=45)
            for bar, score in zip(bars, scores):
                ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                       f'{score:.1f}%', ha='center', va='bottom')
            plt.tight_layout()
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png')
            img_buffer.seek(0)
            plots['criteria_coverage'] = base64.b64encode(img_buffer.getvalue()).decode()
            plt.close(fig)

        # Word frequency visualization
        if style_metrics.get('word_frequency_distribution') and len(style_metrics['word_frequency_distribution']) > 0:
            try:
                word_freq = dict(style_metrics['word_frequency_distribution'])
                if len(word_freq) > 1:
                    wordcloud = WordCloud(width=800, height=400, background_color='white', min_font_size=10).generate_from_frequencies(word_freq)
                    fig, ax = plt.subplots(figsize=(10, 5))
                    ax.imshow(wordcloud, interpolation='bilinear')
                    ax.axis('off')
                    ax.set_title('Most Frequent Words')
                    img_buffer = io.BytesIO()
                    plt.savefig(img_buffer, format='png')
                    img_buffer.seek(0)
                    plots['word_cloud'] = base64.b64encode(img_buffer.getvalue()).decode()
                    plt.close(fig)
                else:
                    logger.warning("Skipping word cloud: insufficient unique words")
            except Exception as e:
                logger.warning(f"Could not create word cloud: {e}")
    except Exception as e:
        logger.error(f"Error creating visualizations: {e}")
    return plots

def calculate_advanced_score(quality_metrics, style_metrics, semantic_analysis, criteria, max_score=100):
    """Calculate advanced scoring with multiple factors"""
    score_breakdown = {
        'content_quality': 0,
        'writing_style': 0,
        'criteria_coverage': 0,
        'technical_accuracy': 0
    }
    
    # Content Quality (35%)
    word_count = quality_metrics.get('word_count', 0)
    if word_count >= 1000:
        score_breakdown['content_quality'] += 25
    elif word_count >= 500:
        score_breakdown['content_quality'] += 20
    elif word_count >= 200:
        score_breakdown['content_quality'] += 15
    elif word_count >= 100:
        score_breakdown['content_quality'] += 10
    
    readability = quality_metrics.get('readability_score', 0)
    if readability > 80:
        score_breakdown['content_quality'] += 15
    elif readability > 60:
        score_breakdown['content_quality'] += 10
    elif readability > 40:
        score_breakdown['content_quality'] += 5
    
    # Writing Style (30%)
    lexical_diversity = style_metrics.get('lexical_diversity', 0)
    if lexical_diversity > 0.7:
        score_breakdown['writing_style'] += 12
    elif lexical_diversity > 0.5:
        score_breakdown['writing_style'] += 8
    elif lexical_diversity > 0.3:
        score_breakdown['writing_style'] += 4
    
    transition_words = style_metrics.get('transition_words', 0)
    if transition_words >= 10:
        score_breakdown['writing_style'] += 10
    elif transition_words >= 5:
        score_breakdown['writing_style'] += 7
    elif transition_words >= 2:
        score_breakdown['writing_style'] += 4
    
    passive_voice = style_metrics.get('passive_voice_count', 0)
    if passive_voice <= 2:
        score_breakdown['writing_style'] += 8
    elif passive_voice <= 5:
        score_breakdown['writing_style'] += 5
    elif passive_voice <= 8:
        score_breakdown['writing_style'] += 2
    
    # Criteria Coverage (25%)
    if semantic_analysis and criteria:
        coverage_scores = [analysis['coverage_score'] for analysis in semantic_analysis.values()]
        avg_coverage = np.mean(coverage_scores) if coverage_scores else 0
        if avg_coverage > 0.9:
            score_breakdown['criteria_coverage'] += 25
        elif avg_coverage > 0.7:
            score_breakdown['criteria_coverage'] += 20
        elif avg_coverage > 0.5:
            score_breakdown['criteria_coverage'] += 15
        elif avg_coverage > 0.3:
            score_breakdown['criteria_coverage'] += 10
        else:
            score_breakdown['criteria_coverage'] += 5
    else:
        logger.warning("Semantic analysis empty, using default coverage score")
        score_breakdown['criteria_coverage'] += 5
    
    # Technical Accuracy (10%)
    grade_level = quality_metrics.get('grade_level', 0)
    if 6 <= grade_level <= 10:
        score_breakdown['technical_accuracy'] += 10
    elif 10 < grade_level <= 14:
        score_breakdown['technical_accuracy'] += 7
    elif grade_level <= 16:
        score_breakdown['technical_accuracy'] += 4
    
    total_score = sum(score_breakdown.values())
    final_score = min(total_score, max_score)
    
    logger.info(f"Quality metrics: {quality_metrics}")
    logger.info(f"Style metrics: {style_metrics}")
    logger.info(f"Semantic analysis: {semantic_analysis}")
    logger.info(f"Score breakdown: {score_breakdown}")
    logger.info(f"Final score: {final_score}")
    return final_score, score_breakdown

def parse_criteria(criteria_text):
    """Parse and validate criteria"""
    if not criteria_text.strip():
        logger.warning("Empty criteria received")
        return []
    try:
        criteria = [c.strip() for c in criteria_text.split('\n') if c.strip()]
        logger.info(f"Parsed criteria: {criteria}")
        return criteria
    except Exception as e:
        logger.error(f"Error parsing criteria: {e}")
        return []

@app.route('/')
def index():
    return render_template('index.html', current_year=datetime.now().year)

@app.route('/grade', methods=['POST'])
def grade_assignment():
    try:
        if 'assignment_file' not in request.files:
            flash('No file uploaded')
            return redirect(url_for('index'))
        
        files = request.files.getlist('assignment_file')
        if not files or all(file.filename == '' for file in files):
            flash('No file selected')
            return redirect(url_for('index'))
        
        for file in files:
            if not allowed_file(file.filename):
                flash(f'File type not allowed for {file.filename}. Please upload PDF, TXT, or DOCX files.')
                return redirect(url_for('index'))
        
        criteria_text = request.form.get('criteria', '').strip()
        max_score = int(request.form.get('max_score', 100))
        
        logger.info(f"Received files: {[file.filename for file in files]}")
        logger.info(f"Received criteria (first 500 chars): {criteria_text[:500]}")
        logger.info(f"Max score: {max_score}")
        
        if criteria_text and (criteria_text.startswith('{') or criteria_text.startswith('[')):
            logger.warning("Criteria text resembles JSON, which is unexpected")
            flash('Criteria should be plain text, one per line, not JSON')
            return redirect(url_for('index'))
        
        criteria = parse_criteria(criteria_text)
        if not criteria:
            flash('Please provide valid grading criteria')
            return redirect(url_for('index'))
        
        text = ''
        filepaths = []
        for file in files:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            filepaths.append(filepath)
            extracted_text = extract_text_from_file(filepath)
            if not extracted_text.strip():
                flash(f'Could not extract text from {file.filename}')
                for fp in filepaths:
                    try:
                        os.remove(fp)
                    except Exception as e:
                        logger.warning(f"Failed to remove file {fp}: {e}")
                return redirect(url_for('index'))
            text += extracted_text + '\n'
        
        clean_text = preprocess_text(text)
        logger.info("Analyzing text quality...")
        quality_metrics = analyze_text_quality(clean_text)
        logger.info(f"Quality metrics: {quality_metrics}")
        
        logger.info("Analyzing writing style...")
        style_metrics = analyze_writing_style(clean_text)
        
        logger.info("Analyzing semantic content...")
        semantic_analysis = analyze_semantic_content(clean_text, criteria) if criteria else {}
        
        if not isinstance(semantic_analysis, dict):
            logger.error(f"semantic_analysis is not a dictionary: {type(semantic_analysis)}")
            semantic_analysis = {}
        
        logger.info("Analyzing sentiment and tone...")
        sentiment_analysis = analyze_sentiment_and_tone(clean_text)
        
        logger.info("Generating comprehensive feedback...")
        comprehensive_feedback = generate_comprehensive_feedback(
            clean_text, criteria, quality_metrics, style_metrics, semantic_analysis, sentiment_analysis
        )
        
        logger.info("Calculating advanced score...")
        final_score, score_breakdown = calculate_advanced_score(
            quality_metrics, style_metrics, semantic_analysis, criteria, max_score
        )
        
        logger.info("Creating visualizations...")
        plots = create_visualizations(quality_metrics, style_metrics, semantic_analysis)
        
        results = {
            'filename': ', '.join([file.filename for file in files]),
            'final_score': round(final_score, 1),
            'max_score': max_score,
            'percentage': round((final_score / max_score) * 100, 1),
            'score_breakdown': score_breakdown,
            'quality_metrics': quality_metrics,
            'style_metrics': style_metrics,
            'semantic_analysis': semantic_analysis,
            'sentiment_analysis': sentiment_analysis,
            'comprehensive_feedback': comprehensive_feedback,
            'plots': plots,
            'text_preview': clean_text[:800] + '...' if len(clean_text) > 800 else clean_text,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'criteria': criteria
        }
        
        for filepath in filepaths:
            try:
                os.remove(filepath)
                logger.info(f"Successfully removed file {filepath}")
            except Exception as e:
                logger.warning(f"Failed to remove file {filepath}: {e}")
        
        return render_template('results.html', results=results, current_year=datetime.now().year)        
    except Exception as e:
        logger.error(f"Error in grade_assignment: {str(e)}", exc_info=True)
        flash(f'Error processing assignment: {str(e)}. Please check the input format.')
        if 'filepaths' in locals():
            for filepath in filepaths:
                try:
                    os.remove(filepath)
                    logger.info(f"Successfully removed file {filepath} after error")
                except Exception as e:
                    logger.warning(f"Failed to remove file {filepath} after error: {e}")
        return redirect(url_for('index'))

@app.route('/api/grade', methods=['POST'])
def api_grade_assignment():
    try:
        data = request.get_json()
        text = data.get('text', '')
        criteria = data.get('criteria', [])
        max_score = data.get('max_score', 100)
        
        if not text.strip():
            logger.error("No text provided in API request")
            return jsonify({'error': 'No text provided'}), 400
        
        if not criteria or not all(isinstance(c, str) and c.strip() for c in criteria):
            logger.warning("No valid criteria provided in API request")
            return jsonify({'error': 'No valid grading criteria provided'}), 400
        
        logger.info(f"API received text (first 500 chars): {text[:500]}")
        logger.info(f"API received criteria: {criteria}")
        
        clean_text = preprocess_text(text)
        quality_metrics = analyze_text_quality(clean_text)
        style_metrics = analyze_writing_style(clean_text)
        semantic_analysis = analyze_semantic_content(clean_text, criteria)
        sentiment_analysis = analyze_sentiment_and_tone(clean_text)
        comprehensive_feedback = generate_comprehensive_feedback(
            clean_text, criteria, quality_metrics, style_metrics, semantic_analysis, sentiment_analysis
        )
        final_score, score_breakdown = calculate_advanced_score(
            quality_metrics, style_metrics, semantic_analysis, criteria, max_score
        )
        
        response = {
            'final_score': round(final_score, 1),
            'max_score': max_score,
            'percentage': round((final_score / max_score) * 100, 1),
            'score_breakdown': score_breakdown,
            'quality_metrics': quality_metrics,
            'style_metrics': style_metrics,
            'semantic_analysis': semantic_analysis,
            'sentiment_analysis': sentiment_analysis,
            'comprehensive_feedback': comprehensive_feedback,
            'criteria': criteria
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in api_grade_assignment: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/test_models')
def test_models():
    """Test model loading status"""
    return jsonify({k: v is not None for k, v in analyzer.models.items()})

def analyze_text_quality(text):
    """Enhanced text quality analysis"""
    if not text.strip():
        logger.warning("Empty text in analyze_text_quality")
        return {
            'word_count': 0,
            'sentence_count': 0,
            'paragraph_count': 0,
            'avg_sentence_length': 0,
            'readability_score': 0,
            'grade_level': 0,
            'automated_readability_index': 0,
            'unique_words': 0,
            'avg_word_length': 0
        }
    
    words = word_tokenize(text.lower())
    sentences = sent_tokenize(text)
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    
    word_count = len([w for w in words if w.isalnum()])
    sentence_count = len(sentences)
    paragraph_count = len(paragraphs)
    unique_words = len(set([w for w in words if w.isalnum()]))
    
    avg_sentence_length = word_count / sentence_count if sentence_count > 0 else 0
    avg_word_length = np.mean([len(w) for w in words if w.isalnum()]) if words else 0
    
    try:
        readability_score = flesch_reading_ease(text)
        grade_level = flesch_kincaid_grade(text)
        ari_score = automated_readability_index(text)
    except Exception as e:
        logger.error(f"Error calculating readability metrics: {e}")
        readability_score = 0
        grade_level = 0
        ari_score = 0
    
    metrics = {
        'word_count': word_count,
        'sentence_count': sentence_count,
        'paragraph_count': paragraph_count,
        'avg_sentence_length': round(avg_sentence_length, 2),
        'readability_score': round(readability_score, 2),
        'grade_level': round(grade_level, 2),
        'automated_readability_index': round(ari_score, 2),
        'unique_words': unique_words,
        'avg_word_length': round(avg_word_length, 2),
        'lexical_diversity': round(unique_words / word_count if word_count > 0 else 0, 3)
    }
    
    logger.info(f"Text quality metrics: {metrics}")
    return metrics

if __name__ == '__main__':
    print("Starting Enhanced AI Assignment Grading System...")
    logger.info("Starting Flask application with enhanced AI features")
    app.run(debug=True, host='0.0.0.0', port=5100)