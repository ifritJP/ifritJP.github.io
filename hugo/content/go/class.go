package main

import "fmt"
import "time"

type IF interface {
    sub1 () int
}

type ParentMtd interface {
    sub1 () int
}

type Parent struct {
    val1 int
    fp ParentMtd
}
func (self *Parent) sub1() int {
    return self.val1
}

func newParent(val1 int) *Parent {
    parent := Parent{ val1, nil }
    parent.fp = &parent
    return &parent
}

type SubMtd interface {
    sub2 () int
}

type Sub struct {
    super Parent
    val2 int
    fp SubMtd
}
func (self *Sub) sub1() int {
    return self.val2
}
func (self *Sub) sub2() int {
    return self.val2
}

func newSub(val1,val2 int) *Sub {
    sub := Sub{ Parent{ val1, nil }, val2, nil }
    sub.super.fp = &sub
    sub.fp = &sub
    return &sub
}


type SubSubMtd interface {
    sub3 () int
}

type SubSub struct {
    super Sub
    val3 int
    fp SubSubMtd
}
func (self *SubSub) sub1() int {
    return self.val3
}
func (self *SubSub) sub2() int {
    return self.super.sub2()
}
func (self *SubSub) sub3() int {
    return self.val3
}


func newSubSub(val1,val2,val3 int) *SubSub {
    subsub := SubSub{ Sub{ Parent{ val1, nil }, val2, nil }, val3, nil }
    subsub.super.super.fp = &subsub
    subsub.super.fp = &subsub
    subsub.fp = &subsub
    return &subsub
}

func test(parent *Parent) int {
    return parent.fp.sub1()
}
func test2(sub *Sub) int {
    return sub.fp.sub2()
}

func Test() (int,int) {
    parent := newParent( 1 )
    sub := newSub( 1, 10 )
    subsub := newSubSub( 1, 10, 100 )
    return test( parent ) + test( &sub.super ) + test( &subsub.super.super ), test2( sub ) + test2( &subsub.super )
}

func main() {
    fmt.Println( Test() )
    subsub := newSubSub( 1, 10, 100 )
    {
        var obj IF = subsub.super.super.fp;
        fmt.Println( obj.sub1() )
        subsub2 := obj.(*SubSub)
        fmt.Println( subsub2.sub3() )
    }
    
    
    start := time.Now()
    
    for count := 0; count < 1000000; count++ {
        Test()
    }
    
    end := time.Now()
    fmt.Println( (float32)((end.Sub( start )).Milliseconds()) / 1000 )
}
