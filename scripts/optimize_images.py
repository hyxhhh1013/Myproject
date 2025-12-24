import os
from PIL import Image
import sys

def resize_images(directory, max_width=1600):
    print(f"Scanning {directory}...")
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                file_path = os.path.join(root, file)
                try:
                    img = Image.open(file_path)
                    # Check size
                    if img.width > max_width or os.path.getsize(file_path) > 1024 * 1024: # > 1MB
                        ratio = max_width / float(img.width)
                        new_height = int((float(img.height) * float(ratio)))
                        
                        # Resize
                        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                        
                        # Save back
                        img.save(file_path, optimize=True, quality=80)
                        print(f"Resized: {file}")
                except Exception as e:
                    print(f"Error processing {file}: {e}")

if __name__ == "__main__":
    # Install Pillow if not exists
    try:
        import PIL
    except ImportError:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
        from PIL import Image

    target_dir = os.path.join(os.getcwd(), 'frontend', 'src', 'assets', 'images')
    resize_images(target_dir)
