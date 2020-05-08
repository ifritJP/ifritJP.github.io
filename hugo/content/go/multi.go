package main

import "fmt"

// func gets() (int,int) {
//     return 1, 2
// }
// func add( val1, val2, val3 int ) {
//     fmt.Println( val1 + val2 + val3 )
// }
// func main() {
//     add( 0, gets() ) // error
//     add( gets(), 3 ) // error
// }

func hoge1( vals ...int ) {
    for _, val := range( vals ) {
        fmt.Printf( "%v ", val )
    }
    fmt.Println()
}
func main() {
    hoge1( 1, 2 )
    work := []int{ 1, 2 }
    hoge1( work... )
}


// func test( vals []int ) {
//     for _, val := range( vals ) {
//         fmt.Printf( "%v ", val )
//     }
//     fmt.Println( "" )
// }

// func hoge1( vals ...int ) {
//     test( vals )
// }
// func hoge2( val int, vals ...int ) {
//     test( append( []int{ val }, vals... ) )
// }
// func hoge3( val int, val2 int, vals ...int ) {
//     test( append( []int{ val, val2 }, vals... ) )
// }

// func sub() (int,int) {
//     return 1, 2
// }

// func main() {
//     hoge1( 1, 2 )
//     hoge1( sub() )

//     hoge2( 1, 2 )
//     hoge2( sub() )

//     hoge3( 1, 2 )
//     hoge3( sub() )
// }
