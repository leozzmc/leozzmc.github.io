---
title: "\U0001F9EA Building an HTTP Server Step by Step with Winsock"
description: Trying out building a network-layer socket with Winsock on Windows and doing application-layer protocol parsing on top of it
toc: true
tags:
  - Network Programming
categories:
  - Study Notes
aside: true
abbrlink: "34f1f1b8"
date: 2023-01-23 01:46:35
---

> 🌐 中文版：[繁體中文](/posts/34f1f1b8.html)

![](https://i.imgur.com/dcWHOfV.png)


The main goal here is to try building a network-layer socket with Winsock on Windows and then do application-layer protocol parsing on top of it. The language is C, the platform is VSCode, and this time I learned by way of the recently very popular [ChatGPT](https://chat.openai.com/), then did my own debugging and dug into the syntax from there.

## Sample code

```c=
#include <stdio.h>
#include <string.h>
#include <winsock2.h>

#define PORT 80 // HTTP uses port 80 by default
#define BACKLOG 10 // max length of the pending-connection queue
#define BUFFER_SIZE 4096 // size of the receive buffer

int main(void)
{
    // Initialize the WinSock library
    WSADATA wsaData;
    int result = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (result != 0) {
        printf("WSAStartup failed: %d\n", result);
        return 1;
    }

    // Create a socket
    SOCKET listenSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (listenSocket == INVALID_SOCKET) {
        printf("socket failed: %d\n", WSAGetLastError());
        WSACleanup();
        return 1;
    }

    // Bind the socket to the local address and port
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

    // Listen on the socket
    result = listen(listenSocket, BACKLOG);
    if (result == SOCKET_ERROR) {
        printf("listen failed: %d\n", WSAGetLastError());
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }

    // Block and wait for a client to connect
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
        // Read the request the client sent
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

    // Parse the HTTP request
    char method[16];
    char url[256];
    char version[16];
    sscanf_s(buffer, "%s %s %s", method, (unsigned int)sizeof(method), url, (unsigned int)sizeof(url), version, (unsigned int)sizeof(version));
    printf("Parsed request: method=%s, url=%s, version=%s\n", method, url, version);

    // Build the HTTP response
    char response[BUFFER_SIZE];
    sprintf_s(response, BUFFER_SIZE, "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nHello, World!");
    int responseLen = (int)strlen(response);

        // Send the HTTP response
    result = send(clientSocket, response, responseLen, 0);
    if (result == SOCKET_ERROR) {
        printf("send failed: %d\n", WSAGetLastError());
        closesocket(clientSocket);
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }
    printf("Sent response:\n%s", response);

    // Close the sockets
    closesocket(clientSocket);
    closesocket(listenSocket);
    WSACleanup();
    return 0;
}

```

## Main program flow
1. Initialize the WinSock library
2. Listen on a socket and wait for a client to connect
3. Receive the client request and parse its method, URL, and protocol version
4. Build the HTTP response and send it to the client
5. Close the socket and clean up the Winsock resources

## Walking through the code
- First you must include the `<winsock2.h>` header
- Then load the WinSock DLL
    ```c=
    WSADATA wsaData;
    int result = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (result != 0) {
        // error handling
    }
    ```
- Create a socket
    ```c=
    // Create a socket
    SOCKET listenSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (listenSocket == INVALID_SOCKET) {
        // error handling
    }
    ```
- Bind the socket to the local address and port
    ```c=
    // Bind the socket to the local address and port
    struct sockaddr_in serverAddress;
    serverAddress.sin_family = AF_INET;
    serverAddress.sin_addr.s_addr = INADDR_ANY;
    serverAddress.sin_port = htons(PORT);
    result = bind(listenSocket, (SOCKADDR*)&serverAddress, sizeof(serverAddress));
    if (result == SOCKET_ERROR) {
        // error handling
    }
    ```
- Listen on the socket
    ```c=
    result = listen(listenSocket, BACKLOG);
    if (result == SOCKET_ERROR) {
        // error handling
    }
    ```
- Wait for a client to connect
    ```c=
    printf("Waiting for client to connect...\n");
    struct sockaddr_in clientAddress;
    int clientAddressLen = sizeof(clientAddress);
    SOCKET clientSocket = accept(listenSocket, (SOCKADDR*)&clientAddress, &clientAddressLen);
    if (clientSocket == INVALID_SOCKET) {
      // error handling
    }
    printf("Client connected.\n");
    ```
- Read the client request
    ```c=
    char buffer[BUFFER_SIZE];
    int recvLen = recv(clientSocket, buffer, BUFFER_SIZE, 0);
    if (recvLen <= 0) {
       // error handling
    }
    buffer[recvLen] = '\0';
    printf("Received request:\n%s", buffer);
    ```
- Parse the HTTP request
    ```c
    char method[16];
    char url[256];
    char version[16];
    sscanf_s(buffer, "%s %s %s", method, (unsigned int)sizeof(method), url, (unsigned int)sizeof(url), version, (unsigned int)sizeof(version));
    printf("Parsed request: method=%s, url=%s, version=%s\n", method, url, version);
    ```
- Build the HTTP response
    ```c=
    char response[BUFFER_SIZE];
    sprintf_s(response, BUFFER_SIZE, "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nHello, World!");
    int responseLen = (int)strlen(response);
    ```
- Send the HTTP response
    ```c=
    result = send(clientSocket, response, responseLen, 0);
    if (result == SOCKET_ERROR) {
        // error handling
    }
    printf("Sent response:\n%s", response);
    ```
- Close the sockets
    ```c=
    closesocket(clientSocket);
    closesocket(listenSocket);
    WSACleanup();
    ```

## Program output
- Start the HTTP server
![](https://i.imgur.com/J1qd5dQ.png)
- Visit http://localhost/
![](https://i.imgur.com/wowoin8.png)
- Terminal output
![](https://i.imgur.com/ViLckvN.png)


## Usage and meaning of the functions in Winsock2.h

- **WSAStartup**
    - Used to initialize the Winsock library. It takes a version argument of type **WORD** and a struct pointer of type **WSADATA**
    - Returns an integer: 0 if the call succeeds, otherwise an error code
- **socket**
    - Used to create a new socket. It takes three arguments: protocol family, socket type, and protocol type
    - ```c=
      SOCKET WSAAPI socket(
          [in] int af,
          [in] int type,
          [in] int protocol
      );
      ```
    - It returns a **SOCKET**
- **bind**
    - Binds a socket to the local address and port. It takes three arguments: socket descriptor, address, and address length
    - ```c=
      int WSAAPI bind(
       [in] SOCKET         s,
       [in] const sockaddr *name,
       [in] int            namelen
      );
      ```
    - Returns an integer
- **listen**
    - Used to listen on a socket and wait for a client to connect. It takes two arguments: the socket descriptor and the max length of the pending-connection queue
    - ```c=
      int WSAAPI listen(
          [in] SOCKET s,
          [in] int    backlog
        );
      ```
     - Returns an integer
- **accept**
    - Accepts a client connection and returns a new socket descriptor
    - Takes two arguments: the socket descriptor and a pointer to the client address
    - ```c=
      SOCKET WSAAPI accept(
         [in]      SOCKET   s,
         [out]     sockaddr *addr,
         [in, out] int      *addrlen
      );
      ```
    - Returns a value of type **SOCKET** representing the new socket descriptor
- **recv**
    -  Receives data sent by the client
    -  Takes four arguments: the socket descriptor, a pointer to the receive buffer, the buffer size, and receive options
    -  ```c=
       int WSAAPI recv(
          [in]  SOCKET s,
          [out] char   *buf,
          [in]  int    len,
          [in]  int    flags
        );
       ```
    - Returns an integer
- **send**
    -  Sends data to the client
    -  Takes four arguments: the socket descriptor, a pointer to the send buffer, the buffer size, and send options
    -  ```c=
       int WSAAPI send(
         [in] SOCKET     s,
         [in] const char *buf,
         [in] int        len,
         [in] int        flags
        );
       ```
    - Returns an integer
- **closesocket**
    - Closes a socket
    - Takes a socket descriptor as its argument
    - ```c=
      int WSAAPI closesocket(
          [in] SOCKET s
      );  
      ```
    - Returns an integer
- **WSACleanup**
    - Cleans up the WinSock library resources. Takes no arguments and returns an integer
    - ```c=
      int WSAAPI WSACleanup();
      ```
For any of the functions above that return an integer, a return value of 0 means the call succeeded, otherwise it is an error code.
