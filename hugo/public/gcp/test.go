package main
import "strings"
import "fmt"
import "encoding/json"

type Hoge struct {
    Val1 int
    Val2 string
}
func main() {
    reader := strings.NewReader( `{ "Val1": 1, "Val2": "abc" }` )
    var item Hoge
    if err := json.NewDecoder( reader ).Decode( &item ); err != nil {
        fmt.Printf( "error: %v\n", err ) // 失敗
    } else {
        fmt.Printf( "decode: %v\n", item ) // 成功
    }
}
