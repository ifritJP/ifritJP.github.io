#include<stdio.h>
typedef void (func_t)( int val1, int val2 );
void func( int val1, int val2 )
{
    printf( "%d %d\n", val1, val2 );
}
static func_t * s_func = func;
void wrapper0( int val1, int val2 )
{
    s_func( val1, val2 );
}
void wrapper1( func_t * pFunc, int val1, int val2 )
{
    pFunc( val1, val2 );
}
void wrapper2( int val1, int val2, func_t * pFunc )
{
    pFunc( val1, val2 );
}
main() {
    wrapper0( 0, 1 );
    wrapper1( func, 0, 1 );
    wrapper2( 0, 1, func );
}
