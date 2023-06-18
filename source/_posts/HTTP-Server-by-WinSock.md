---
title: 🧪透過 Winsock 依序堆疊出一個HTTP Server
description: 實做看看在Windows環境下透過Winsocks來建立網路層的Socket並且去進行應用層的協定解析
toc: true
tags: ['網路程式']
categories: [學習筆記]
date: 2023-01-23T09:46:35+08:00
---

![](https://i.imgur.com/dcWHOfV.png)


主要想實做看看在Windows環境下透過Winsocks來建立網路層的Socket並且去進行應用層的協定解析，使用程式語言為C語言，平台則是使用VSCode，本次的學習方式是透過最近很火紅的 [ChatGPT](https://chat.openai.com/) 來進行學習，並再自行Debug和研究語法。

## 範例程式碼

```c=
#include <stdio.h>
#include <string.h>
#include <winsock2.h>

#define PORT 80 // HTTP預設使用端口80
#define BACKLOG 10 // 等待連接佇列的最大長度
#define BUFFER_SIZE 4096 // 接收緩衝區的大小

int main(void)
{
    // 初始化WinSock庫
    WSADATA wsaData;
    int result = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (result != 0) {
        printf("WSAStartup failed: %d\n", result);
        return 1;
    }

    // 建立Socket
    SOCKET listenSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (listenSocket == INVALID_SOCKET) {
        printf("socket failed: %d\n", WSAGetLastError());
        WSACleanup();
        return 1;
    }

    // 綁定Socket到本地地址和端口
    struct sockaddr_in serverAddress;
    serverAddress.sin_family = AF_INET;
    serverAddress.sin_addr.s_addr = INADDR_ANY;
    serverAddress.sin_port = htons(PORT);
    result = bind(listenSocket, (SOCKADDR*)&serverAddress, sizeof(serverAddress));
    if (result == SOCKET_ERROR) {
        printf("bind failed: %d\n", WSAGetLastError());
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }

    // 監聽Socket
    result = listen(listenSocket, BACKLOG);
    if (result == SOCKET_ERROR) {
        printf("listen failed: %d\n", WSAGetLastError());
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }

    // 阻塞等待客戶端的連接
    printf("Waiting for client to connect...\n");
    struct sockaddr_in clientAddress;
    int clientAddressLen = sizeof(clientAddress);
    SOCKET clientSocket = accept(listenSocket, (SOCKADDR*)&clientAddress, &clientAddressLen);
    if (clientSocket == INVALID_SOCKET) {
        printf("accept failed: %d\n", WSAGetLastError());
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }
    printf("Client connected.\n");
        // 讀取客戶端發送的請求
    char buffer[BUFFER_SIZE];
    int recvLen = recv(clientSocket, buffer, BUFFER_SIZE, 0);
    if (recvLen <= 0) {
        printf("recv failed: %d\n", WSAGetLastError());
        closesocket(clientSocket);
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }
    buffer[recvLen] = '\0';
    printf("Received request:\n%s", buffer);

    // 解析HTTP請求
    char method[16];
    char url[256];
    char version[16];
    sscanf_s(buffer, "%s %s %s", method, (unsigned int)sizeof(method), url, (unsigned int)sizeof(url), version, (unsigned int)sizeof(version));
    printf("Parsed request: method=%s, url=%s, version=%s\n", method, url, version);

    // 構造HTTP回應
    char response[BUFFER_SIZE];
    sprintf_s(response, BUFFER_SIZE, "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nHello, World!");
    int responseLen = (int)strlen(response);

        // 發送HTTP回應
    result = send(clientSocket, response, responseLen, 0);
    if (result == SOCKET_ERROR) {
        printf("send failed: %d\n", WSAGetLastError());
        closesocket(clientSocket);
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }
    printf("Sent response:\n%s", response);

    // 關閉Socket
    closesocket(clientSocket);
    closesocket(listenSocket);
    WSACleanup();
    return 0;
}

```

## 程式主要流程
1. 初始化 WinSock 函式庫
2. 監聽Socket等待client端連接
3. 接收client請求並解析其Method、URL以及協定版本
4. 建構HTTP Response，發送給client端
5. 關閉socket並清理Winsock資源

## 程式解釋
- 首先一定要引入 <winsock2.h> 標頭檔
- 接著載入WinSock DLL
    ```c=
    WSADATA wsaData;
    int result = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (result != 0) {
        // 錯誤處理
    }
    ```
- 建立socket
    ```c=
    // 建立Socket
    SOCKET listenSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (listenSocket == INVALID_SOCKET) {
        //錯誤處理
    }
    ```
- 綁定socket到本地位址與port
    ```c=
    // 綁定Socket到本地地址和端口
    struct sockaddr_in serverAddress;
    serverAddress.sin_family = AF_INET;
    serverAddress.sin_addr.s_addr = INADDR_ANY;
    serverAddress.sin_port = htons(PORT);
    result = bind(listenSocket, (SOCKADDR*)&serverAddress, sizeof(serverAddress));
    if (result == SOCKET_ERROR) {
        //錯誤處理
    }
    ```
- 監聽Socket
    ```c=
    result = listen(listenSocket, BACKLOG);
    if (result == SOCKET_ERROR) {
        //錯誤處理
    }
    ```
- 等待客戶端連接
    ```c=
    printf("Waiting for client to connect...\n");
    struct sockaddr_in clientAddress;
    int clientAddressLen = sizeof(clientAddress);
    SOCKET clientSocket = accept(listenSocket, (SOCKADDR*)&clientAddress, &clientAddressLen);
    if (clientSocket == INVALID_SOCKET) {
      //錯誤處理
    }
    printf("Client connected.\n");
    ```
- 讀取客戶端請求
    ```c=
    char buffer[BUFFER_SIZE];
    int recvLen = recv(clientSocket, buffer, BUFFER_SIZE, 0);
    if (recvLen <= 0) {
       //錯誤處理
    }
    buffer[recvLen] = '\0';
    printf("Received request:\n%s", buffer);
    ```
- 解析HTTP請求
    ```c
    char method[16];
    char url[256];
    char version[16];
    sscanf_s(buffer, "%s %s %s", method, (unsigned int)sizeof(method), url, (unsigned int)sizeof(url), version, (unsigned int)sizeof(version));
    printf("Parsed request: method=%s, url=%s, version=%s\n", method, url, version);
    ```
- 建構HTTP回覆
    ```c=
    char response[BUFFER_SIZE];
    sprintf_s(response, BUFFER_SIZE, "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nHello, World!");
    int responseLen = (int)strlen(response);
    ```
- 發送HTTP回覆
    ```c=
    result = send(clientSocket, response, responseLen, 0);
    if (result == SOCKET_ERROR) {
        //錯誤處理
    }
    printf("Sent response:\n%s", response);
    ```
- 關閉socket
    ```c=
    closesocket(clientSocket);
    closesocket(listenSocket);
    WSACleanup();
    ```

## 程式執行結果
- 啟動HTTP Server
![](https://i.imgur.com/J1qd5dQ.png)
- 存取 http://localhost/ 
![](https://i.imgur.com/wowoin8.png)
- 終端顯示結果
![](https://i.imgur.com/ViLckvN.png)


## Winsock2.h 中的函式用法及意義

- **WSAStartup**
    - 用於初始化 Winsock 函式庫，接收資料型別為**WORD**的版本參數以及資料型別為**WSADATA**的struct pointer
    - 會回傳整數，函式呼叫成功則回傳0，否則回傳error code
- **socket**
    - 用於建立新的socket，接收三個參數: 協定家族、socket種類以及協定類型
    - ```c=
      SOCKET WSAAPI socket(
          [in] int af,
          [in] int type,
          [in] int protocol
      );
      ```
     - 他會回傳一個 **SOCKET**
- **bind**
    - 綁定Socket到本地地址和port，接收三個參數:socket 描述子、位址以及位址長度
    - ```c=
      int WSAAPI bind(
       [in] SOCKET         s,
       [in] const sockaddr *name,
       [in] int            namelen
      );
      ```
    - 回傳整數
- **listen**
    - 用於監聽socket，等待客戶端連接，它接收兩個參數：socket描述子以及和等待連接佇列的最大長度
    - ```c=
      int WSAAPI listen(
          [in] SOCKET s,
          [in] int    backlog
        );
      ```
     - 回傳整數
- **accept**
    - 接受客戶端的連接，並回傳一個新的Socket描述子
    - 接收兩個參數: Socket描述子和客戶端地址的pointer
    - ```c=
      SOCKET WSAAPI accept(
         [in]      SOCKET   s,
         [out]     sockaddr *addr,
         [in, out] int      *addrlen
      );
      ```
    - 會回傳一個 **SOCKET** 型別的值，以表示新的Socket描述子
- **recv**
    -  接收客戶端發送的資料
    -  接收四個參數: Socket描述子、接收緩衝區的pointer、緩衝區的大小和接收選項
    -  ```c=
       int WSAAPI recv(
          [in]  SOCKET s,
          [out] char   *buf,
          [in]  int    len,
          [in]  int    flags
        );
       ```
    - 回傳整數
- **send**
    -  發送資料到客戶端
    -  他接受四個參數: Socket描述子、發送緩衝區的pointer、緩衝區的大小和發送選項
    -  ```c=
       int WSAAPI send(
         [in] SOCKET     s,
         [in] const char *buf,
         [in] int        len,
         [in] int        flags
        );
       ```
    - 回傳整數
- **closesocket**
    - 關閉Socket
    - 接收一個socket 描述子作為參數
    - ```c=
      int WSAAPI closesocket(
          [in] SOCKET s
      );  
      ```
    - 回傳整數
- **WSACleanup**
    - 清理WinSock函式庫的資源，不接收任何參數，並回傳整數
    - ```c=
      int WSAAPI WSACleanup();
      ```
上述函式中任何回傳整數的函式，若回傳值為0，則為函式呼叫成功，否則為Error code
