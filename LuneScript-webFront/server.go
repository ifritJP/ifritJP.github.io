package main

import (
    "net/http"
    "fmt"
    "net"
    "strings"
)

var port=28080
var content_path="/contents"

func main() {
    // 現在の IP アドレスを取得
    addrList, _ := net.InterfaceAddrs()
    var localAddr string
    for _, addr := range addrList {
        localAddr = addr.String()
        if strings.Index( localAddr, "192.168." ) == 0 {
            if index := strings.Index( localAddr, "/" ); index > 0 {
                localAddr = localAddr[:index]
            }
            break
        }
    }      

    // HTTPD サーバ起動
    endPoint := fmt.Sprintf( "http://%s:%d", localAddr, port )
    fmt.Println( "Start Server:" )
    fmt.Printf( "  -- %s%s\n", endPoint, content_path )
    http.ListenAndServe( fmt.Sprintf( ":%d", port ), nil)
}
