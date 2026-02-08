<!-- root/SETUP.md -->

# Git

Skapa Git-repo
```
git init
```

Låt branchen heta *main* istället för *master*
```
git branch -m master main
```

Pusha första committen till GitHub
```
git add <some_files>
git commit -m "some_message"
git branch -M main
git remote add origin https://github.com/...
git push -u origin main
```
