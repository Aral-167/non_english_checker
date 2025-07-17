from flask import Flask, render_template, request
import re
import json

app = Flask(__name__)

def find_non_english_characters(text):
    """
    Find all non-English characters and their positions in the text.
    Returns a list of dictionaries with character, position, and line info.
    """
    non_english_chars = []
    pattern = r"[^A-Za-z0-9 .,!?\"'()\[\];:\-\n\r]"
    
    lines = text.split('\n')
    char_position = 0
    
    for line_num, line in enumerate(lines):
        for char_pos, char in enumerate(line):
            if re.match(pattern, char):
                non_english_chars.append({
                    'character': char,
                    'position': char_position + char_pos,
                    'line': line_num + 1,
                    'column': char_pos + 1,
                    'unicode_name': get_unicode_name(char),
                    'unicode_code': f"U+{ord(char):04X}"
                })
        char_position += len(line) + 1  # +1 for newline character
    
    return non_english_chars

def get_unicode_name(char):
    """Get the Unicode name of a character."""
    import unicodedata
    try:
        return unicodedata.name(char)
    except ValueError:
        return "UNKNOWN CHARACTER"

def contains_non_english(text):
    return bool(re.search(r"[^A-Za-z0-9 .,!?\"'()\[\];:\-\n\r]", text))

def highlight_non_english_text(text):
    """
    Create a highlighted version of the text with non-English characters marked.
    """
    pattern = r"[^A-Za-z0-9 .,!?\"'()\[\];:\-\n\r]"
    highlighted = re.sub(pattern, r'<span class="highlight-char">\g<0></span>', text)
    return highlighted

@app.route("/", methods=["GET", "POST"])
def index():
    message = ""
    input_text = ""
    non_english_chars = []
    highlighted_text = ""
    char_count = 0

    if request.method == "POST":
        input_text = request.form["text"]
        char_count = len(input_text)
        
        if input_text.strip():
            non_english_chars = find_non_english_characters(input_text)
            highlighted_text = highlight_non_english_text(input_text)
            
            if non_english_chars:
                char_word = "character" if len(non_english_chars) == 1 else "characters"
                message = f"⚠️ {len(non_english_chars)} non-English {char_word} detected!"
            else:
                message = "✅ All characters are English."
        else:
            message = "Please enter some text to check."

    return render_template("index.html", 
                         message=message, 
                         text=input_text,
                         non_english_chars=non_english_chars,
                         highlighted_text=highlighted_text,
                         char_count=char_count)

if __name__ == "__main__":
    app.run(debug=True)
