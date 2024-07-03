---
title: 建立 Lambda 函數 URL 的步驟
tags:
  - AWS
  - Lambda
categories: 實作紀錄
aside: true
abbrlink: 421a206a
date: 2024-01-03 20:41:05
cover: /img/AWS/Lambda_URL/cover.jpg
---

# 甚麼是 Lambda URL ?

> 官方定義: 函數 URL 是 Lambda 函數專用的 HTTP(S) 端點。您可以透過 Lambda 主控台或 Lambda API 建立及設定函數 URL。當您建立函數 URL 時，Lambda 會自動為您產生不重複的 URL 端點。函數 URL 一旦建立，其 URL 端點便永遠不會變更。

函數 URL 端點的格式如下：
```
https://<url-id>.lambda-url.<region>.on.aws
```

要特別注意的是，某些region並不支援使用 function URL，這時可能就要用老方法: API Gateway + Lambda Integration

## 存取控制

在建立 function URL 的時候可以透過 `AuthType` 參數，來決定 Lambda 如何對 funcion URL 的請求執行身分驗證或授權

AuthType 選項:
- `AWS_IAM` : 　如果想讓已完成身分驗證的使用者或Role透過function URL 呼叫你的函數，就要選 `AWS_IAM`
- `NONE`:   Lambda 不會在呼叫函數前執行任何身分驗證，但Lambda Function 的Resource Policy永遠有效，還是必須要授予存取權，Function URL 才能接收請求。

> 細節可以參考[這裡](https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/urls-auth.html)

# 如何建立 Lambda URL?

## 建立 Execution Role

－ 建立一個具有 `AWSLambdaBasicExecutionRole` 權限 的 Role

```
{
  "Version" : "2012-10-17",
  "Statement" : [
    {
      "Effect" : "Allow",
      "Action" : [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource" : "*"
    }
  ]
}
```

![](/img/AWS/Lambda_URL/execution_role.png)

- 註記 role ARN:
```
Role ARN: arn:aws:iam::1XXXXXXXXXXX:role/Lambda-URL_Role
```
##　建立具有函數 URL 的 Lambda 函數 (.zip 封存檔)

1. Write Function Code

```javascript
exports.handler = async (event) => {
    let body = JSON.parse(event.body);
    const product = body.num1 * body.num2;
    const response = {
        statusCode: 200,
        body: "The product of " + body.num1 + " and " + body.num2 + " is " + product,
    };
    return response;
};
```
2. Create deployment packages

```
zip function.zip index.js
```
3. 使用 `create-function` 命令建立一個 Lambda 函數。

```
aws lambda create-function \
    --function-name my-url-function \
    --runtime nodejs18.x \
    --zip-file fileb://function.zip \
    --handler index.handler \
    --role arn:aws:iam::1XXXXXXXXXXX:role/Lambda-URL_Role
```
![](/img/AWS/Lambda_URL/deployment_package.png)

4. 將 resource policy 新增至授予許可的函數，以允許公開存取函數 URL。

```
aws lambda add-permission \
    --function-name my-url-function \
    --action lambda:InvokeFunctionUrl \
    --principal "*" \
    --function-url-auth-type "NONE" \
    --statement-id url
```

> 因為是測試方便所以選 NONE，但最好還是要提供AWS_IAM驗證

Return policy

![](/img/AWS/Lambda_URL/return_policy.png)

5. 使用 `create-function-url-config` 命令為函數建立 URL 端點

```
aws lambda create-function-url-config \
    --function-name my-url-function \
    --auth-type NONE
```

Return Endpoint

![](/img/AWS/Lambda_URL/return_endpoint.png)

Endpoint:  https://xxxxxxxxxxuxxxxxxxxxxxxxxxxxxxxxx.lambda-url.us-east-1.on.aws/


## 測試端點

```
curl 'https://abcdefg.lambda-url.us-east-1.on.aws/' \
-H 'Content-Type: application/json' \
-d '{"num1": "10", "num2": "10"}'
```

![](/img/AWS/Lambda_URL/test_endpoint.png)

## 建立函數 URL 的 CloudFormation

下面是用於建立 Function URL 的CFN YAML檔，可以輕鬆建立對應資源:
```yaml
Resources:
  MyUrlFunction:
    Type: AWS::Lambda::Function
    Properties:
      Handler: index.handler
      Runtime: nodejs18.x
      Role: arn:aws:iam::123456789012:role/lambda-url-role
      Code:
        ZipFile: |
          exports.handler = async (event) => {
              let body = JSON.parse(event.body);
              const product = body.num1 * body.num2;
              const response = {
                  statusCode: 200,
                  body: "The product of " + body.num1 + " and " + body.num2 + " is " + product,
              };
              return response;
          };
      Description: Create a function with a URL.
  MyUrlFunctionPermissions:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref MyUrlFunction
      Action: lambda:InvokeFunctionUrl
      Principal: "*"
      FunctionUrlAuthType: NONE
  MyFunctionUrl:
    Type: AWS::Lambda::Url
    Properties:
      TargetFunctionArn: !Ref MyUrlFunction
      AuthType: NONE
```
##　建立具有函數 URL 的 Lambda 函數 (AWS SAM)

而這個是可以透過SAM 建立資源的YAML檔

```yaml
ProductFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: function/.
    Handler: index.handler
    Runtime: nodejs18.x
    AutoPublishAlias: live
    FunctionUrlConfig:
      AuthType: NONE
```

# Reference
[1] https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/lambda-urls.html
[2] https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/urls-tutorial.html