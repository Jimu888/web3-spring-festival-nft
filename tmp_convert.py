from moviepy import VideoFileClip
import os

inp='public/nft-preview.mov'
out='public/nft-preview.mp4'

clip=VideoFileClip(inp)
clip=clip.without_audio()

w,h=clip.w,clip.h
if w!=h:
    m=min(w,h)
    x1=(w-m)//2
    y1=(h-m)//2
    clip=clip.cropped(x1=x1,y1=y1,width=m,height=m)

# 预览用：高度720（最终上链前可再压更小）
clip=clip.resized(height=720)

clip.write_videofile(
    out,
    codec='libx264',
    audio=False,
    preset='medium',
    ffmpeg_params=['-movflags','+faststart'],
    threads=2,
    logger=None,
)
clip.close()

print('wrote', out, 'bytes', os.path.getsize(out))
