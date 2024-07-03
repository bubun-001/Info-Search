import re

def remove_latex_tags(text):
    """
    Remove LaTeX tags from the given text.
    """
    # Pattern to match LaTeX commands
    latex_command_pattern = r'\\[^\s]*\{.*?\}|\\[^\s]*'

    # Remove LaTeX commands
    cleaned_text = re.sub(latex_command_pattern, '', text)

    return cleaned_text

def create_overlapping_paragraphs(paragraphs, overlap_length=200):
    overlapping_paragraphs = []
    
    for i in range(len(paragraphs) - 1):
        # Append the overlap to the current paragraph, ensuring it ends at a sentence break
        end_of_current = paragraphs[i][-overlap_length:]
        sentence_break = end_of_current.rfind(". ")
        if sentence_break != -1:
            overlap = end_of_current[sentence_break + 2:]  # Start after the period and space
        else:
            overlap = end_of_current  # No sentence break found, use the whole overlap
        
        overlapped_paragraph = paragraphs[i] + overlap
        overlapping_paragraphs.append(overlapped_paragraph)

    overlapping_paragraphs.append(paragraphs[-1])  # Add the last paragraph without overlap

    return overlapping_paragraphs


def extract_actual_paragraphs(tex_content):
    """
    Extract actual paragraphs from a LaTeX file, defined as text between section or subsection tags,
    and further split by blank lines to get distinct paragraphs.
    """
    # Regex pattern to find sections or subsections
    section_pattern = r'\\(?:sub)*section\{.*?\}'
    
    # Split the content into sections/subsections
    sections = re.split(section_pattern, tex_content)

    # Further split each section by blank lines to get paragraphs
    paragraphs = []
    for section in sections:
        # Splitting by blank lines
        section_paragraphs = section.strip().split('\n\n')
        paragraphs.extend(section_paragraphs)

    return paragraphs

# # Read your TeX file
# file_path = r"C:\Users\Sailesh\Documents\aveti\ncert math books\Physics book\Physics book.tex\2023_12_06_b7fd14ff40d8ca59b830g\2023_12_06_b7fd14ff40d8ca59b830g.tex"
# with open(file_path, 'r', encoding='utf-8') as file:
#     tex_content = file.read()

# # Extract actual paragraphs from the TeX content
# actual_paragraphs = extract_actual_paragraphs(tex_content)

# # Removing LaTeX tags from each paragraph
# cleaned_paragraphs = [remove_latex_tags(paragraph) for paragraph in actual_paragraphs]


# # Create overlapping paragraphs
# overlapping_paragraphs = create_overlapping_paragraphs(cleaned_paragraphs, overlap_length=200)
# for i in overlapping_paragraphs[250:280]:
#     print(i)
#     print("\n")
# # Save the cleaned paragraphs to a text file
# overlaped_output_file_path = 'your_output_file_path.txt'
# with open(overlaped_output_file_path, 'w', encoding='utf-8') as file:
#     for paragraph in overlapping_paragraphs:
#         file.write(paragraph + "\n\n")

# The cleaned paragraphs are now saved to 'your_output_file_path.txt'
def filter_paragraphs_with_wordlimit(paragraphs, min_word_count=5):
    filtered_paragraphs = []
    for paragraph in paragraphs:
        word_count = len(re.findall(r'\b\w+\b', paragraph))
        if word_count >= min_word_count:
            filtered_paragraphs.append(paragraph)
    return filtered_paragraphs

def data_preprocessing(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        tex_content = file.read()

    # Extract paragraphs
    actual_paragraphs = extract_actual_paragraphs(tex_content)

    # Remove LaTeX tags
    cleaned_paragraphs = [remove_latex_tags(paragraph) for paragraph in actual_paragraphs]

    # Filter paragraphs with a minimum word count
    filtered_paragraphs = filter_paragraphs_with_wordlimit(cleaned_paragraphs, min_word_count=10)

    # Create overlapping paragraphs
    overlapping_paragraphs = create_overlapping_paragraphs(filtered_paragraphs, overlap_length=200)

    return overlapping_paragraphs

# file_path = r"C:\Users\Sailesh\Downloads\physics book\Physics book\2023_12_06_01ef020640a6b9ad8bb4g\2023_12_06_01ef020640a6b9ad8bb4g.tex" # Replace with your file path
# processed_paragraphs = data_preprocessing(file_path)
# for i in processed_paragraphs[250:270]:
#     print(i)
#     print("\n")
