# TODO - Media & Asset Audit (Al-Samaei Travel)

## Step 1 — Repo inventory & gaps
- [x] Confirm existing pages in workspace.
- [x] Identify external hotlinked media in:
  - [x] index.html (coverr.co hero video)
  - [x] gallery.html (Unsplash images)
  - [x] videos.html (Unsplash thumbnails + YouTube iframes)
  - [x] script.js (Unsplash images embedded in package/blog data)
- [ ] Verify whether these required pages exist and can be edited:
  - [ ] blog.html
  - [ ] faq.html
  - [ ] contact.html

## Step 2 — Add required local assets structure
- [ ] Create folders:
  - [ ] assets/images/
  - [ ] assets/videos/
  - [ ] assets/icons/
  - [ ] assets/logo/
- [ ] Add placeholder/fallback media files (placeholders are allowed until real files provided):
  - [ ] assets/images/placeholder.jpg
  - [ ] assets/videos/placeholder.mp4

## Step 3 — Replace all hotlinked media
- [ ] Replace index.html hero <video> source with local: assets/videos/index-hero.mp4
- [ ] Replace gallery.html <img> src/data-full with local assets/images/gallery*.jpg
- [ ] Replace videos.html:
  - [ ] Remove YouTube iframes and use HTML5 <video> with local assets/videos/*.mp4
  - [ ] Replace thumbnail images with local assets/images/*.jpg
- [ ] Replace script.js embedded Unsplash URLs:
  - [ ] PACKAGE_DATA.img
  - [ ] BLOG_POSTS.img

## Step 4 — Safety & compatibility
- [ ] Ensure all media paths are relative (GitHub Pages compatible)
- [ ] Add fallback onerror attributes for every <img>
- [ ] Ensure missing files load placeholder via onerror

## Step 5 — Complete asset checklist
- [ ] Generate assets checklist listing every image/video required by each page.
- [ ] Ensure checklist matches actual paths referenced after edits.

## Step 6 — Final verification
- [ ] Verify the 11 pages mentioned in requirements exist and have no external hotlinks.
- [ ] Confirm offline behavior (no external http(s) media sources remain).

