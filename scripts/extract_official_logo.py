from pathlib import Path
from PIL import Image

source = Path("/home/ubuntu/upload/pasted_file_o0sJNu_image.png")
output = Path("/home/ubuntu/webdev-static-assets/pharmayemen-official-flat-mark.png")

with Image.open(source).convert("RGBA") as board:
    # The user approved the left, colored flat SaaS version. Extract only its symbol,
    # excluding the title and wordmark so the website can retain an accessible text lockup.
    mark = board.crop((35, 188, 340, 388))
    canvas = Image.new("RGBA", (320, 320), (255, 255, 255, 255))
    canvas.alpha_composite(mark, ((320 - mark.width) // 2, (320 - mark.height) // 2))
    canvas.resize((512, 512), Image.Resampling.LANCZOS).save(output, optimize=True)

print(output)
