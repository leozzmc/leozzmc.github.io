---
title: "\U0001F4D1Github Action 學習筆記"
description: 學習 GitHub Actions CI/CD 平台的使用以及其yaml檔撰寫的採坑紀錄
toc: true
tags:
  - CI/CD
  - GitHub
categories:
  - 學習筆記
aside: true
abbrlink: 24be9e02
date: 2022-11-10 05:27:45
---

> 🌐 English version: [English](/en/posts/24be9e02.html)


![](https://i.imgur.com/zn0lCzN.png)

我以前其實沒有CI/CD的經驗，所以現有常見的CI/CD平台其實都沒有太過了解，但近期因專案需求，需要透過Github Action　來建立一個用於Azure認知服務中的**斷句API (BreakSentence API)** 的CI/CD Pipeline，在被交付的需求還很模糊的狀況下😭，還是先來了解這項功能，並且做個紀錄。


## 基本介紹
是一個CI/CD平台，能夠自動化建置(Build)、測試(Test)以及部署(Deployment)，使用者可以建立工作流程(Workflow)來建置以及測試每個對Repository的pull請求或者是將合併的pull請求部署到生產環境。

## Components

構成Github Actions中的元件名詞如下
- Workflow
- Event
- Jobs
- Runner
- Steps
- Action

先講這些元件的合作起來的行為會是怎麼樣: 當Repository中發生某個 **事件(Event)**，此時你所設定的 Github Actions **Workflows** 被觸發。這裡的事件，舉例來說可以是**一個pull request請求**或是**某個issued被建立** 等等。

!['Github Action workflows'](https://i.imgur.com/SuvKp3J.png)



你所定義的Workflow當中包含了一個或多個 **Jobs** ，這些Jobs可以是被**平行處理(Parallel)** 或是 **依序處理(Sequential)** ，每個Jobs會在自己的虛擬機Runner被處理，或者是在容器內運行。而每個Jobs中有包含了一個或多個 **Steps** ，會執行你定義的腳本或是某個 **Action**，Action是Github Action當中的最小單位，是一個可重複使用的擴展，通常是某些通用指令(?😥)


##  🔀Workflows
- 一個可設定來自動化流程的一個或多個Jobs被稱作為Workflow，可以透過撰寫YAML檔來定義Workflow,並在Event發生時被觸發，也可以手動觸發。
- Workflow被定義在Repo中的 `.github/workflows` 路徑底下
- 一個Repo可以有多個Workflows，並負責執行各種不同的任務
    - 像是，一個用於Build跟Test的Workflow
    - 另一個則是在Release發布後部署應用到生產環境的Workflow

##  ✴️Events
Event代表在Repository中的特定行為，像是:
- pull request
- open issues
- psuhes a commit to repo ...etc

用於觸發Workflows的Event可以參考這份文件
https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows

##  🗂️Jobs
一組Steps被稱作Job,並且執行在Runner上，每個Steps可能會是一個Shell Script或是Action被執行。Steps會依序執行，且由於每個Steps是在相同的Runner上被執行，因此可以在不同Steps之間共享相同資料。 舉例： 一個step建置完應用後另一個step來測試應用。

你也可以設定Jobs的依賴項，一旦一個Jobs依賴另一個Job，則會等待另一個Job完成後才開始執行自己的任務。
https://docs.github.com/en/actions/using-jobs

##  📑Actions
Action是一個專為Github Action平台設計的程序，可執行複雜、高頻率且重複的工作。
透過Action可以減少出現在workflow檔案中大量重複的程式碼。
一個Action可以做到像是從Github當中拉取repository，並為所建置的環境設定正確的工具集，並設定好與你的雲端供應用商之間的身分驗證。

設定Action:https://docs.github.com/en/actions/creating-actions

##  📦Runners
用於運行workflow的Server，每個Runner一次只會執行一個Job。
Github提供 Ubuntu、Windows以及MacOS Runner來執行Workflow。
也會大型Runner需求者提供解決方案:https://docs.github.com/en/actions/using-github-hosted-runners/using-larger-runners
若所需執行環境需要不同的OS或特規硬體設定，使用者也可以host自己的Runner https://docs.github.com/en/actions/hosting-your-own-runners

## 建立 Workflow
Github Action 使用YAML來建立Workflow。每個 Workflow 都以獨立的YAML檔儲存，並且放置在 `.github/workflows` 路徑底下

## 建立範例 Workflows
- 建立路徑:  `.gituhb/workflows`
- 在 `.github/workflows` 當中建立 `learn-github-action.yml`
```yaml
name: learn-github-actions
run-name: ${{ github.actor }} is learning GitHub Actions
on: [push]
jobs:
  check-bats-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '14'
      - run: npm install -g bats
      - run: bats -v
```
- commit 這次的更動，並 push 到 repository

## Workflows File 逐行解釋
參考: [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore)

- `name` : 指定Workflow名稱，並會出現在Repository中的Action Tab
- `run-name` : 每次運行該Workflow時會出現的文字訊息，這邊指定 repo username + "is learning Github Actions"

![](https://i.imgur.com/B5l23tf.png)

- `on` : 指定會觸發 Workflows 的行為，這裡使用 `push` event，所以依但有人 push更動到 repository，則會觸發 Workflows的執行
-  `jobs` : 將 Workflows當中的job組合在一起
-  `check-bats-version` : 自定義Job的名稱
- `runs-on`: 設定Job執行在OS為最新版本的Ubuntu Linux的Runner上，此指定會觸發Hosted所託管的虛擬機被建立。
- `steps`: 將 `check-bats-version` job 底下的所有step組合再一起
- `uses`:　用來指定step的命令或行為
    - `actions/checkout@v3`: 代表要執行v3版本的actions/checkout行為，**此步驟會將你的repo checkout到Runner上，並允許你針對你的程式進行操作，每當你的Workflow將針對Repository的程式運行時，都應該使用 checkout 操作**
    - `actions/setup-node@v3`: 此步驟會安裝指定版本的NodeJS(此範例中視版本1)
- `run` : run指令會告訴 job在Runner中執行特定指令，此範例終究是告訴Job在Runner中執行 npm install bats，以及下一步則是去查看 bats版本

## 尋找以及自定義 Actions
一個Action可以被定義在:
- 與你Workflow檔案相同的Repository當中
- 所有公開的Repository
- DockerHub中的已發布的容器image當中

### Github Action Martketplace
[Marketplace連結](https://github.com/marketplace?type=actions)

![](https://i.imgur.com/oFXdxsj.png)

在Marketplace 當中有許多其他貢獻者所提供的Action，可以下載

![](https://i.imgur.com/TFdKxou.png)

每個Action當中會有提供相應的YAML Synatx可以複製並貼上至自己的Workflow檔案當中，若Action需要你提供Input，則需要額外設定Workflow，可參考這份文件
，https://docs.github.com/en/actions/learn-github-actions/finding-and-customizing-actions#using-inputs-and-outputs-with-an-action

### 在相同Repository底下添加 Action

*範例檔案結構*
```
|-- hello-world (repository)
|   |__ .github
|       └── workflows
|           └── my-first-workflow.yml
|       └── actions
|           |__ hello-world-action
|               └── action.yml
```
*範例 Workflow 檔*

```yaml[]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # This step checks out a copy of your repository.
      - uses: actions/checkout@v3
      # This step references the directory that contains the action.
      - uses: ./.github/actions/hello-world-action
```
synatx: `./path/to/dir`

而 action.yml 是為了Action提供Metadata用的。

### 從不同 Repository 加入 Action

這時在你的workflow檔當中的 use 底下就需要指定 `{owner}/{repo}@{ref}` 來標明 reference action的repo，範例:  `actions/setup-node@v3`

### 引用 DockerHub上的容器

此時 syntax需要改成: `docker://{image}:{tag}`


## 實作: Azure Break Sentence CI/CD Pipeline

*整體架構圖*
![](https://i.imgur.com/OvSfq3m.png)

### Event需求
### Runner 環境套件設定
- OS: Ubuntu Linux
- Python 3.8.10
- Environment Variables
    - AZURE_API_KEY
    - AZURE_LOCATION

> 感覺可以自定義Actions

### Break Sentence

![](https://i.imgur.com/kd6kJ2X.png)

🧪目標: **在使用者上傳檔案時，就能夠擷取裡面的文章，去呼叫BreakSentence.py 進行斷句，再保存到特定Ouput Folder**


### Task

- [x]  Azure API Key 被Disable  -> 變更信箱重新註冊或付費續訂
- [x] 測試 YML檔透過環境變數方式來存取Secrets
- [x] 變更Repository中所存放的Secrets值
- [x] `BreakSentence.py` -> 需加上讀檔功能
    - [ ] 可能要可以開文字檔以及Excel檔
- [x] `BreakSentence.py` -> 要包裝成指令工具


![](https://i.imgur.com/xnAfxMl.png)
~~目前在Setup Python就會出錯~~ ✅已解決

![](https://i.imgur.com/Sz9BA33.png)
~~沒有指定 Module，需用pip 指令安裝特定模組~~ ✅已解決

![](https://i.imgur.com/McSwZ3L.png)
~~無法存取Secret中的值作為環境變數~~ ✅已解決
需要將env 區段放到run breaksentence.py的區段底下
![](https://i.imgur.com/tlKx4k7.png)


![](https://i.imgur.com/2AFUYyK.png)
執行成功 

![](https://i.imgur.com/ortWe1v.png)

目前腳本中只有把api call的reponse印出來以及切句子存在List
下一步驟就是改變輸入輸出方式

  


## 參考資料
[1]https://ithelp.ithome.com.tw/articles/10266827
[2]https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions
[3]https://docs.github.com/en/actions/learn-github-actions/finding-and-customizing-actions
[4] [Github Action Push到Azure雲端](https://ithelp.ithome.com.tw/articles/10266828)

