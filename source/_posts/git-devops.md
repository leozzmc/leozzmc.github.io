---
title: Git for DevOps 筆記 |【DevOps技能樹】
tags:
  - DevOps
  - Git
categories: 學習筆記
aside: true
toc: true
abbrlink: '22911275'
date: 2025-11-11 11:45:46
cover: /img/devops/git/cover.png
---


# Basic


> ***Q:你要如何確認一個目錄是一個 git repository?***

檢查是否有 `.git` 文件

> ***Q:請解釋什麼是 `git directory`, `working directory`, `staging area`***

**Git目錄**: 
適用於儲存項目歷史紀錄的地方。包含所有 commit history, branch, label 等資料，存放於專案目錄中的 `.git` 資料夾內。

Git 目錄其實就是負責管理版本的主要資料存放地，可以透過 `git log` 命令查看資訊

**工作目錄**
目前正在操作的專案目錄。在工作目錄中，git 會去提取 Git 目錄中的某個特定版本(正常會是最新版本)，並將檔案提取出來，讓使用者可以直接編輯跟修改。

使用者對於工作目錄的變更並不會自動被 git 偵測，需要手動進行 `add` 以及 `commit` 進行更新。

**Staging Area(暫存區)**
是一個臨時空間，可以讓你暫時將工作目錄的變更添加到暫存區，等待進一步提交，所以當你進行 `git add` 的時候，檔案就會從工作目錄轉移到暫存區。最終當使用 `git commit` 的時候，Git 就會將暫存區內容提交到 Git 目錄中 (`.git`)，形成新的提交。 


> ***Q:`git pull` 以及 `git fetch` 之間有什麼差異？***

簡單來說 `git pull` =  `git fetch` + `git merge`

**`git fetch`** 就是單純從遠端倉庫下載最新的變更到本地端，並更新本地的remote branch 紀錄 (`orgin/main`) 但並不會將這些變合併到當前的工作分支，因此在 `git fecth` 後需要手動使用 `git merge` 或 `git rebase`

**`git pull`** 就是 `git fetch` 和 `git merge` 的組合指令。

**如果在進行 `git pull` 時，若遠端或本地都有修改，就可以遇到合併衝突**

> ***Q:要如何確定一個檔案是否是 tracked的？若沒有則track***

1. 檢查檔案是否被追蹤

使用 `git status` 來檢查當前檔案狀態，如果檔案出現在 `Untracked files` 中則代表該檔案未被追蹤，而如果檔案在 `Changes not stagged for commit` 則代表已經被追蹤，但修改尚未提交

以本篇部落格為例

```
On branch en
Your branch is up to date with 'origin/en'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   source/_posts/k8s-devops.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        source/_posts/git-dveops.md
```

2. 將未被追蹤的檔案加入追蹤

```
git add <file>
```

> ***Q: 請解釋 gitignore 用途是什麼?***

用於確保特定檔案不會被 Git 追蹤。 當你新增或修改    `.gitignore`，希望讓 Git 忽略某些檔案或資料夾，但發現它們已經被 Git 追蹤時，可以先使用 `git rm --cached` 將這些檔案從追蹤中移除，然後 Git 就會依據`gitignore` 忽略它們。

Example
```
git rm --cached -r node_modules/
```

> ***Q: 當你在 Commit 之前可以透過哪些方法得知做了哪些變更?***

```
git diff
```
如果是要看最新的commit 以及 staging area 之間的差異，可以加上 `cached` 參數

```
git diff --cached
```

若要查看工作目錄與最新commit之間的差異

```
git diff HEAD
```

# 情境題

> ***Q: 你有個檔案在遠端倉庫中，但你不希望Git追蹤他，你做什麼來讓後續Git 都不追蹤該檔案***

將改檔案添加到 `gitignore` 當中，使該檔案不會被添加到 staging area

> ***Q: 在你們組織中，有個開發團隊使用單體式遠端倉庫，該repo十分巨大，包含上千份檔案，開發團隊發現他們進行一般 git 操作變得十分緩慢，像是 git status，請問這是什麼原因導致，你該如何幫助他們？***

問題分析：
1. 檔案數量太大根複雜目錄結構會導致像是 `git diff`, `git status` 操作進行比對時增加負擔
2. 大量歷史紀錄會讓讀取時效能降低
3. 如果文件本身也很大，也會導致修改檔案時速度變慢

解決辦法：
1. 架構調整，使用 git submodule 或者 git subtree 將單體式架構拆分成多個小倉庫，將不同部分移到各自獨立的倉庫中。
2. 如果是要 clone 專案，如果開發者只需要最新的版本，不需要完整記錄，則可以使用 `--depth` 參數進行淺層的 clone
3. 而如果開發者只需要專案中的某些特定資料夾或檔案，可以使用 **Sparse Checkout**  來 checkout 所需要的部分

```bash
git sparse-checkout init --cone
git sparse-checkout set <PATH_TO_FOLDER>
```

4. 使用 **GIT LFS** 來管理大文件

```bash
git lfs install
git lfs track "*.c" # track all big .c files
```

# Branches

Branch 是在 git 中程式碼的平行開發線，可以讓開發者在不影響主線程式碼的情況下進行變更。

> ***什麼是 branch strategy (flow)? 舉例一下有哪些 branch strategy***


**Git Flow**

![](/img/devops/git/gitflow.png)
*Image Source: [https://medium.com/@sreekanth.thummala](https://medium.com/@sreekanth.thummala/choosing-the-right-git-branching-strategy-a-comparative-analysis-f5e635443423
)*


適合 release 週期長，有穩定版本需求的專案。

- main branch: 主分支，用於儲存穩定且發佈的版本
- develop branch: 開發分支，所有新功能會在本分支合併
- feature branch: 功能分支，用於開發新功能，每個新功能會應該基於 devlop branch 去建立，並且需要在開發完成後合併回 develop
- release branch: 發布分支，當 develop 分支的程式碼達到可發布的階段時，會從develop branch 去建立 release branch 進行最後測試和修正
- hotfix branch: 熱修復分支，用於緊急修復已發布版本的問題，需要從 main branch 建立，修復完畢後合併回 main 跟 develop

> 缺點: 頻繁建立分支再合併可能會增加git hostory的複雜度

**GitHub Flow**

![](/img/devops/git/githubflow.png)

GitHub Flow 較為輕量化，適合快速迭代跟持續部署的專案，只有兩個主要分支，通常比較適合小型團隊

- main branch: 主分支，包含穩定且隨時可部署的程式碼
- feature branches: 功能分支，開發人員會從 main branch 建立新的 branch 來開發新功能或修復bug。在功能完成並測試後，會發Pull Request(PR) 並合併回 main branch

> 缺點: 不適合生命週期長的專案

**GitLab Flow**

![](/img/devops/git/gitlab.png)

結合了 Git Flow 跟 GitHub Flow 的特色，適合複雜度介於兩者之間的專案，允許在不同環境進行測試和部署，適合有多個測試環境、且需要穩定發布的專案。

- main branch: 主分支，儲存穩定版本
- feature branch: 功能分支，用於開發新功能跟修正錯誤，會從 main branch 開始建立，完成後會合併回 main branch
- environment branches: 環境分支，Ex. pre-production, staging 等。對應不同的部署環境，可以再進行測試與驗證
- relase branch: 發布分支，用於特定版本的發布管理

> 缺點：多版本管理時複雜度一樣會提升

**Trunk Based Development**

![](/img/devops/git/trunk.png)

這種Flow 更加極端，主要強調快速開發跟持續整合。

- main branch: 唯一的主要分支，所以開發活動都直接合併到主分支
- 短暫的 feature branches: 功能分支存在時間非常短暫，通常在幾天內完成並合併回 main，或直接在 main 上進行開發。

> 缺點: 對自動化測試和CI/CD 系統高度仰賴。團隊技術和協作能力要求高


> ***現在你有兩個 branch，分別是 main 和 dev，你要如何確保兩個 branch 是同步的？***

```bash
git checkout main
git pull
git checkout dev
git merge main
```

> ***當我執行 git branch 命令執行時，他的工作原理，實際會發生什麼事情?***

Git 此時在背後會做的事情會是 **1. 建立一個新的分支指標**，git 會在 `.git/refs/heads` 資料夾中建立新的檔案，檔案名稱會是你設定的分支名稱。接著會 **指向到當前的 commit**，剛剛所說的新檔案，檔案內容會是一個指向當前commit 的 SHA-1 hash 值，代表新分支從當前 commit 開始

> ***當你跑 `git branch` 命令時，Git 要怎麼知道最新commit 的 SHA-1 值？***

會去 `.git/refs/heads` 找到對應的 branch 名稱後輸出對應的SHA-1 值

```
~/leozzmc.github.io/.git/refs/heads
❯ cat en 
fc58a8885d29bc422d8089e08eaf826d41a2b5c8
```

當你 checkout 到其他 branch 的時候，Git 同時也會去更新 `.git/HEAD` 為 `refs/heads/<Branch Name>`


# Merge

> ***你現在有兩個 branch: main 和 dev，要如何將 dev merge到 main?***

```bash
git checkout main
git merge dev
git push origin main
```

> ***要如何解決合併衝突(Merge Conflicts)?***

首先要確認有衝突的檔案是哪個? 可以透過 `git status` 查看，這些檔案會 `unmerged`。接著打開有衝突的檔案，git 應該會標記有衝突的區域，像是

```
<<<<<<< HEAD
// 來自當前分支（HEAD）的變更
=======
 // 來自要合併分支的變更
>>>>>>> branch-name
```

接著可能就是要跟其他開發者或團隊溝通，看要保留哪些部分。檔案編輯完畢後保存檔案，就可以透過 `git add <filename>` 來標記衝突已解決。之後就可以 commmit 了。

> ***你熟悉哪些 merge strategies嗎?***

Git 中有好幾種常見的 Merge 策略，像是

**Fast-Forward**

如果合併的 branch 和 main branch 沒有新的commit時，可以使用 Fast-Forward merge。 Git 會將 main branch 的指標直接 fast-forward 到 branch 的最新commit，並且不會建立新的 merge commit。這種方式適合線性開發的情況，讓git history 保持清晰。

```
git merge <branch_name> --ff
```

**Recursive**
這是Git 預設的merge策略，如果要合併有共同祖先的的分支時，會先從共同的 base commit 開始計算雙方分支的差異，然後自動生成 merge commit。

```
git merge <branch-name>
```

**Squash**

Squash Commit 會將所有的commit 壓縮成一個 commit，並且合併到目標 branch，這樣主要分支上就只會出現一個commit 紀錄。

這種做法適合用在完成功能開發後，將零碎的commit 打包成一個乾淨的commit

```
git merge --squash <branch-name>
```

**Octopus**

適合多個 branch 同時合併的情況，通常會是將多個feature branches 合併到 main branch。git 會同時將多個分支上的變更合併成一個 commit。

```
git merge <branch1> <branch2> <branch3>
```

**Ours Merge**

特殊的合併策略，**當 merge conflicts 無法解決或不希望保留其他分支的變更時，可以使用 Ours Merge。**

這種策略就是即使有衝突，Git 也會選擇保留當前branch的內容，而捨棄被合併分支的變更。這種策略通常用於臨時的緊急合併或無法協調的衝突狀況。


```
git merge -s ours <branch_name>
```

> ***`git reset`以及`git revert`之間的差異是什麼？***

`git revert` 用來提交一個新的 commit 來抵銷之前的 commit

假設今天有 commit A, commit B, commit C，若現在想要撤銷對 B 的變更，則可以藉由命令 `git revert B` 來去建立一個新的 commit D，這個 commit 得內容會跟 B 的相反，這樣最終得commit history 會是 A->B->C->D


`git reset` 則用於重置當前 branch 的指標(HEAD) 到指定的commit上，並且可以選擇是否保留對於工作目錄的變更。 **這就代表 `git reset` 可以變更 branch 的 commit history**

```
git reset --soft <commit-hash> #僅移動HEAD
git reset --mixed <commit-hash>
git reset --hard <commit-hash>
```

# Rebase

> ***什麼情況下你會使用 `git rebase`?***

當今天個團隊正在一個 feature branch 上開發新功能，這個 feature branch 是從 main branch 長出來的。當 feature 的開發完成了，團隊希望將功能 merge 到 main branch 並且不希望保留 feature branch上的任何commit 則可以使用 git rebase。

(但其實有更好的做法就是用 `git merge --squash`，先將 feature branch 上的所有提交壓縮成一個commit)

> ***要如何將一個特定檔案反轉成先前的commit?***

```
git checkout HEAD~1 -- /path/to/the/file
```

或者

```
git restore --source-<commit-hash> -- <filename>
```
`git restore` 是較新的指令，功能與 checkout 類似，這樣會把檔案恢復到指定的提交內容


> ***要如何 squash 最後兩個 commit?***

若這兩個 commit 還沒push，則可以 revert回前兩個commit然後再一次提交

```
git reset --soft HEAD~2
git commit -m "new combined commit message"
```

但如果這兩個 commit 已經 push到 repo了，那就要用 

```

git rebase -i HEAD~2
```

這會打開編輯器，會顯示提交歷史，可能會像是下面這樣

```
pick <commit-hash-1> Commit message for the second-to-last commit
pick <commit-hash-2> Commit message for the last commit
```

只要將第二行的pick變更為 `squash`，這就代表將最後一個提交壓縮到倒數第二個提交中 

```
pick <commit-hash-1> Commit message for the second-to-last commit
squash <commit-hash-2> Commit message for the last commit
```

保存退出後，並且修改新的commit訊息，就可以看見兩個commit合併成同一個了


> ***如何刪除一個 remote branch?***

```
git push orgin --delete <branch>
```

{% note warning %}
刪除遠端分支後，其他協作成員將無法再從遠端倉庫中拉取該分支!
{% endnote %}


> ***什麼是 gitattributes ?***

`.gitattributes` 是Git 中的一種設定檔， **用於設定檔案的屬性和處理方式**，可以讓使用這在 Git 操作過程中 (Ex. merge, commit) 時對檔案進行處理

主要用途像是
- 管理檔案的行尾(Line Ending): 這也是最常見的用途之一，通常不同OS下對於檔案中的每一行結尾會使用不同的結尾符號 (Windows: CRLF, Linux: LF )，而這也可能導致不必要的變更衝突，可以透過設定 `.gitattributes` 來統一行尾符號的處理方式。

```
* text=auto
```

上面命令可以讓Git 自動根據系統來設定行尾符號，並在 commit 時將行尾符號轉換成 LF(Unix/Linux)

> ***在 Commit 前要如何刪除local changes***

```
git checkout -- <filename>
```

> ***那又要如何刪除local commit?***

```
git reset HEAD~1
```

這樣可以移除最近一次的 local commit，如果也需要移除local change 可以加上 `--hard`

```
git reset --hard HEAD~1
```

# Git Diff

> ***git diff 會做什麼事情?***

會去查看工作目錄和staging area之間的變更，會顯示所有已修改但未被加入 staging area 的檔案變更。

若想看 staging area 以及最新commit 之間得變更，則是使用

```
git diff --cached
```

若想看工作目錄以及最新commit之間的變更

```
git diff HEAD
```

另外也可以查看任意檔案，兩commits，兩branch 之間的差異

```
git diff <commit1> <commit2>
git diff <filename>
git diff <branch1> <branch2>
```

> ***哪個命令比較快?`git diff-index HEAD`以及 `git diff HEAD`***

`git diff-index HEAD` > `git diff HEAD`

`git diff-index HEAD` 是直接比較索引(staging area) 與特定commit (`HEAD`) 之間的差異，因此不需要掃描整個工作目錄的檔案，所以速度較快

然而 `git diff HEAD` 則是比較整個工作目錄和特定commit 之間的差異，因此會去掃描整個工作目錄並且計算文件的差異，一旦檔案量大時，速度會變慢。

# Git Internal

> ***解釋一下 `git status` 的運作原理***

`git status` 會去進行一系列檢查和比較，

1. 首先會檢查工作目錄跟Staging Area之間的差異，看哪些檔案有修改但未被staged

git 會為每個檔案計算 SHA-1 Hash，查看該hash是否存在於 staging area，如果紀錄不匹配則被視為沒被加入staging area

2. 接著會比較 staging area 跟最新的commit（HEAD）的狀態，來確定哪些檔案已經被加入 staging area 但尚未commit

git 會檢查staging area中的hash 和 HEAD 中提交的 hash值是否一樣

3. 檢查未追蹤檔案

git 會為掃描工作目錄中所有未在staging area 中的檔案，標記成untracked files，但同時 git 也會去檢查 `.gitignore` 的設定，過濾掉那些不應該track的檔案

4. 更新工作狀態

Git 對大型儲存庫執行 `git status` 時，**會使用增量掃描和快取來加快速度**

- Git 有時會啟用 `core.untrackedCache` 來記錄未追蹤檔案的狀態，以避免每次都重新掃描
- 若啟用了 `core.preloadIndex`，Git 會預加載索引，減少磁碟 I/O 操作，從而提高檢查文件狀態的速度


這兩個設定都可以透過 `git config` 來去啟用

> Ref: https://deepinout.com/git/git-questions/218_git_why_is_git_corepreloadindex_default_value_false.html

5. 輸出結果


----