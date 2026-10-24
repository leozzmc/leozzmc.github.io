---
title: Steps to Create a Lambda Function URL
tags:
  - AWS
  - Lambda
categories: Hands-On Practices
aside: true
abbrlink: "421a206a"
date: 2024-01-03 20:41:05
cover: /img/AWS/Lambda_URL/cover.jpg
---

> 🌐 中文版：[繁體中文](/posts/421a206a.html)

# What is a Lambda URL?

> Official definition: A function URL is a dedicated HTTP(S) endpoint for a Lambda function. You can create and configure a function URL through the Lambda console or the Lambda API. When you create a function URL, Lambda automatically generates a unique URL endpoint for you. Once created, the URL endpoint never changes.

The function URL endpoint format is:
```
https://<url-id>.lambda-url.<region>.on.aws
```

Note that some regions don't support function URLs, in which case you may need the old approach: API Gateway + Lambda Integration.

## Access control

When creating a function URL, the `AuthType` parameter determines how Lambda authenticates or authorizes requests to the function URL.

AuthType options:
- `AWS_IAM`: If you want authenticated users or roles to call your function through the function URL, choose `AWS_IAM`.
- `NONE`: Lambda doesn't perform any authentication before invoking the function, but the Lambda function's resource policy is always in effect, so you must still grant access for the function URL to receive requests.

> For details, see [here](https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/urls-auth.html).

# How to create a Lambda URL?

## Create an execution role

- Create a role with the `AWSLambdaBasicExecutionRole` permissions.

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

- Note the role ARN:
```
Role ARN: arn:aws:iam::1XXXXXXXXXXX:role/Lambda-URL_Role
```
## Create a Lambda function with a function URL (.zip archive)

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
3. Create a Lambda function with the `create-function` command.

```
aws lambda create-function \
    --function-name my-url-function \
    --runtime nodejs18.x \
    --zip-file fileb://function.zip \
    --handler index.handler \
    --role arn:aws:iam::1XXXXXXXXXXX:role/Lambda-URL_Role
```
![](/img/AWS/Lambda_URL/deployment_package.png)

4. Add a resource policy to the function granting permission, to allow public access to the function URL.

```
aws lambda add-permission \
    --function-name my-url-function \
    --action lambda:InvokeFunctionUrl \
    --principal "*" \
    --function-url-auth-type "NONE" \
    --statement-id url
```

> I chose NONE for convenient testing, but it's better to provide AWS_IAM authentication.

Return policy

![](/img/AWS/Lambda_URL/return_policy.png)

5. Create a URL endpoint for the function with the `create-function-url-config` command.

```
aws lambda create-function-url-config \
    --function-name my-url-function \
    --auth-type NONE
```

Return Endpoint

![](/img/AWS/Lambda_URL/return_endpoint.png)

Endpoint:  https://xxxxxxxxxxuxxxxxxxxxxxxxxxxxxxxxx.lambda-url.us-east-1.on.aws/

## Testing the endpoint

```
curl 'https://abcdefg.lambda-url.us-east-1.on.aws/' \
-H 'Content-Type: application/json' \
-d '{"num1": "10", "num2": "10"}'
```

![](/img/AWS/Lambda_URL/test_endpoint.png)

## CloudFormation for creating a function URL

Below is the CFN YAML for creating a function URL, which makes it easy to create the corresponding resources:
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
## Create a Lambda function with a function URL (AWS SAM)

And this is the YAML to create the resources via SAM:

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
