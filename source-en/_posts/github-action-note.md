---
title: "\U0001F4D1GitHub Actions Study Notes"
description: Learning the GitHub Actions CI/CD platform and a record of the pitfalls in writing its YAML files
toc: true
tags:
  - CI/CD
  - GitHub
categories:
  - Study Notes
aside: true
abbrlink: "24be9e02"
date: 2022-11-10 05:27:45
---

> 🌐 中文版：[繁體中文](/posts/24be9e02.html)

![](https://i.imgur.com/zn0lCzN.png)

I didn't actually have CI/CD experience before, so I wasn't too familiar with the common CI/CD platforms out there. But recently, due to a project need, I had to use GitHub Actions to build a CI/CD pipeline for a **BreakSentence API** in Azure Cognitive Services. With the delivered requirements still vague 😭, I figured I'd first understand this feature and make a record.

## Basic introduction
GitHub Actions is a CI/CD platform that can automate building, testing, and deployment. Users can create workflows to build and test every pull request to a repository, or deploy merged pull requests to a production environment.

## Components

The component terms that make up GitHub Actions are:
- Workflow
- Event
- Jobs
- Runner
- Steps
- Action

First, how these components work together: when some **event** occurs in a repository, the GitHub Actions **workflows** you configured are triggered. An event here could be, for example, **a pull request** or **an issue being created**, and so on.

!['Github Action workflows'](https://i.imgur.com/SuvKp3J.png)

The workflow you define contains one or more **jobs**, which can be processed in **parallel** or **sequentially**. Each job runs on its own virtual-machine runner or inside a container. Each job contains one or more **steps** that run a script you define or some **action**. An action is the smallest unit in GitHub Actions, a reusable extension, usually some common command (?😥).

## 🔀Workflows
- A workflow is one or more jobs configured to automate a process. You define a workflow by writing a YAML file, and it's triggered when an event occurs, or can be triggered manually.
- Workflows are defined under the `.github/workflows` path in the repo.
- A repo can have multiple workflows responsible for various tasks.
    - For example, one workflow for building and testing
    - And another for deploying the app to production after a release

## ✴️Events
An event represents a specific activity in a repository, such as:
- pull request
- open issues
- pushes a commit to repo, etc.

For the events that can trigger workflows, see this doc:
https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows

## 🗂️Jobs
A set of steps is called a job, and it runs on a runner. Each step may be a shell script or an action that runs. Steps run in order, and since each step runs on the same runner, data can be shared between steps. For example: one step builds the app, then another tests it.

You can also set job dependencies; once one job depends on another, it waits for the other to finish before starting its own task.
https://docs.github.com/en/actions/using-jobs

## 📑Actions
An action is a program designed specifically for the GitHub Actions platform to perform complex, frequent, and repetitive tasks.
Using actions reduces the amount of repetitive code in workflow files.
An action can do things like pull a repository from GitHub, set up the correct toolset for the build environment, and configure authentication with your cloud provider.

Creating actions: https://docs.github.com/en/actions/creating-actions

## 📦Runners
A runner is a server that runs a workflow, and each runner runs one job at a time.
GitHub provides Ubuntu, Windows, and macOS runners to run workflows.
There are also solutions for those needing large runners: https://docs.github.com/en/actions/using-github-hosted-runners/using-larger-runners
If the needed environment requires a different OS or special hardware configuration, you can host your own runner: https://docs.github.com/en/actions/hosting-your-own-runners

## Creating a workflow
GitHub Actions uses YAML to create workflows. Each workflow is stored in its own YAML file placed under the `.github/workflows` path.

## Creating an example workflow
- Create the path: `.github/workflows`
- Create `learn-github-action.yml` inside `.github/workflows`
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
- Commit the change and push it to the repository

## Workflow file explained line by line
Reference: [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore)

- `name`: specifies the workflow name, which appears in the repository's Actions tab
- `run-name`: the text message shown each time the workflow runs; here it's the repo username + "is learning GitHub Actions"

![](https://i.imgur.com/B5l23tf.png)

- `on`: specifies the activity that triggers the workflow; here it uses the `push` event, so the workflow runs whenever someone pushes a change to the repository
- `jobs`: groups the jobs in the workflow together
- `check-bats-version`: a custom job name
- `runs-on`: sets the job to run on a runner with the latest Ubuntu Linux OS; this specification triggers creation of a hosted virtual machine
- `steps`: groups all the steps under the `check-bats-version` job
- `uses`: specifies a step's command or action
    - `actions/checkout@v3`: runs the v3 version of the actions/checkout action. **This step checks out your repo onto the runner and lets you operate on your code. Whenever your workflow runs against the repository's code, you should use the checkout action.**
    - `actions/setup-node@v3`: installs the specified version of Node.js (version 14 in this example)
- `run`: the run command tells the job to execute a specific command on the runner. In this example it tells the job to run npm install bats on the runner, and the next step checks the bats version

## Finding and customizing actions
An action can be defined in:
- The same repository as your workflow file
- Any public repository
- A published container image on DockerHub

### GitHub Actions Marketplace
[Marketplace link](https://github.com/marketplace?type=actions)

![](https://i.imgur.com/oFXdxsj.png)

The Marketplace has many actions provided by other contributors that you can download.

![](https://i.imgur.com/TFdKxou.png)

Each action provides the corresponding YAML syntax you can copy and paste into your own workflow file. If an action requires input, you need to configure the workflow additionally; see this doc:
https://docs.github.com/en/actions/learn-github-actions/finding-and-customizing-actions#using-inputs-and-outputs-with-an-action

### Adding an action in the same repository

*Example file structure*
```
|-- hello-world (repository)
|   |__ .github
|       └── workflows
|           └── my-first-workflow.yml
|       └── actions
|           |__ hello-world-action
|               └── action.yml
```
*Example workflow file*

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # This step checks out a copy of your repository.
      - uses: actions/checkout@v3
      # This step references the directory that contains the action.
      - uses: ./.github/actions/hello-world-action
```
syntax: `./path/to/dir`

And action.yml is for providing metadata for the action.

### Adding an action from a different repository

In this case, under `uses` in your workflow file you specify `{owner}/{repo}@{ref}` to indicate the referenced action's repo, e.g. `actions/setup-node@v3`.

### Referencing a container on DockerHub

Here the syntax changes to: `docker://{image}:{tag}`

## Hands-on: Azure Break Sentence CI/CD Pipeline

*Overall architecture diagram*
![](https://i.imgur.com/OvSfq3m.png)

### Event requirements
### Runner environment package setup
- OS: Ubuntu Linux
- Python 3.8.10
- Environment Variables
    - AZURE_API_KEY
    - AZURE_LOCATION

> Seems like custom actions could work here

### Break Sentence

![](https://i.imgur.com/kd6kJ2X.png)

🧪Goal: **When a user uploads a file, extract the article inside, call BreakSentence.py to segment sentences, and save to a specific output folder.**

### Task

- [x] Azure API key disabled -> change email to re-register, or pay to renew
- [x] Test accessing secrets via environment variables in the YML file
- [x] Change the secret values stored in the repository
- [x] `BreakSentence.py` -> needs file-reading added
    - [ ] May need to open both text files and Excel files
- [x] `BreakSentence.py` -> wrap it as a command-line tool

![](https://i.imgur.com/xnAfxMl.png)
~~Currently errors at Setup Python~~ ✅Resolved

![](https://i.imgur.com/Sz9BA33.png)
~~No module specified, need pip to install the specific module~~ ✅Resolved

![](https://i.imgur.com/McSwZ3L.png)
~~Can't access the secret value as an environment variable~~ ✅Resolved
Need to put the env section under the step that runs breaksentence.py
![](https://i.imgur.com/tlKx4k7.png)

![](https://i.imgur.com/2AFUYyK.png)
Ran successfully

![](https://i.imgur.com/ortWe1v.png)

Currently the script only prints the API call response and saves the segmented sentences in a list.
The next step is to change the input/output method.

## References
[1]https://ithelp.ithome.com.tw/articles/10266827
[2]https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions
[3]https://docs.github.com/en/actions/learn-github-actions/finding-and-customizing-actions
[4] [GitHub Actions Push to Azure Cloud](https://ithelp.ithome.com.tw/articles/10266828)
