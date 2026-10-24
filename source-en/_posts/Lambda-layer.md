---
title: "Lambda Layers: Concept and Hands-On"
toc: true
tags:
  - AWS
  - Lambda
aside: true
categories: Hands-On Practices
abbrlink: "f40d2e89"
date: 2023-10-20 21:10:11
cover: /img/pepe3.jpg
---

> 🌐 中文版：[繁體中文](/posts/f40d2e89.html)

## Preface

When configuring Lambda, the vast majority of people have hit `ImportModuleError`. So you can follow the scenario below, spin up the same Lambda environment, and work through it step by step.

## Scenario
- Region: `IAD(us-east-1)`
- Runtime: `Python3.11`
- Lambda Name: "ITHomeLambdaFunction"
- Lambda code
```python
import json requests

def lambda_handler(event, context):
    # TODO implement
    x = requests.get('https://www.ntust.edu.tw/')
    print(x.text)
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }

```

## \[Error\]: Runtime.ImportModuleError

If you deploy the scenario above and run a test, you may get an error like this:

```
{
  "errorMessage": "Unable to import module 'lambda_function': No module named 'requests'",
  "errorType": "Runtime.ImportModuleError",
  "requestId": ".......",
  "stackTrace": []
}
```

The cause is that from AWS Lambda Python 3.8 runtime onward, the requests module is no longer natively supported, so you need to add a **layer** yourself.

## What is a Lambda layer?

In Lambda, a layer is a zip archive for storing dependencies or modules. Different Lambda functions can also share data through a layer.

Once you add a layer to your Lambda function, **Lambda places the layer's contents into the `/opt` directory in the Lambda execution environment**.

![](https://hackmd.io/_uploads/H1a_iXvk6.png)

> Note: each function can include at most 5 layers.

## Packaging a module into a layer

Depending on the runtime you use, modules in each layer need to follow a different file structure when zipping [1].

For Python, the file structure can be:

- `/opt/python`
- `/opt/python/lib/python3.x/site-packages`

And all runtimes support these two additional directories:
- `/bin (PATH)`
- `/lib (LD_LIBRARY_PATH)`

Now let's package requests into an archive.

1. Package the layer contents locally with the command below (if your package installer is pip3, replace the command's prefix with pip3):

```
pip install requests --target=./python 
```
This creates a python/ directory locally and downloads the needed modules into it. Note that the directory name here must match the language used by the runtime.

2. Package the directory:
```
zip -r layer.zip python/
```
to package all files under the python directory into a single zip.

3. In the Lambda console, there's a **layer** item in the left navigation; clicking it jumps to the layers page, where you can choose to add a new layer.

![](https://hackmd.io/_uploads/SyjslEwya.png)

Name the layer, upload the `layer.zip` you just built, then choose the runtime and architecture to create the layer.

![](https://hackmd.io/_uploads/HkELWNPJa.png)

Once done, go back to the Lambda main page to add the layer.

![](https://hackmd.io/_uploads/HkbdbNvyp.png)

On the add-layer page, choose Custom Layer and you'll see the layer you just created.

![](https://hackmd.io/_uploads/S1esbVwJp.png)

## Testing

Now run the test from the console again and it won't error.

![](https://hackmd.io/_uploads/rkNaf4v16.png)

Or invoke via the AWS CLI:

```
aws lambda invoke \
    --cli-binary-format raw-in-base64-out \
    --function-name ITHomeLambdaFunction \
    --payload '{ "Test": "ITHome" }' \
    response.json
```

![](https://hackmd.io/_uploads/HkRKONw1a.png)

Checking CloudWatch, the data comes through too.
> Though splitting the returned content into separate log entries is a bit weird, lol.

![](https://hackmd.io/_uploads/ryK-tEvkp.png)

## References
[1] [Layer paths for each Lambda runtime](https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/packaging-layers.html#packaging-layers-paths)
