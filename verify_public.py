from pathlib import Path
import os

for name in ["public-readme.md", "public-readme-zh.md"]:
    f = Path(os.environ["TEMP"]) / name
    b = f.read_bytes()
    text = b.decode("utf-8")
    print(name)
    print("LF:", b.count(b"\n"))
    print("CR:", b.count(b"\r"))
    print("first:", text.split("\n")[0])
    print("has downloads:", "Latest Downloads" in text or "最新下载" in text)
    print("has matrix:", "Feature Matrix" in text or "功能矩阵" in text)
    print("has workflows:", "Verified Workflows" in text or "已验证工作流" in text)
    print("has limitations:", "Known Limitations" in text or "已知限制" in text)
    print()
