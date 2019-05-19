#include <sys/time.h>
#include <time.h>
#include <stdio.h>

typedef void (func_t)( void );

double getTime( void ) {
    struct timeval tm;
    gettimeofday( &tm, NULL );
    return tm.tv_sec + tm.tv_usec / 1000000.0;
}
void sub( void ) {
}
void func_direct( func_t * pFunc ) {
    sub();
}
void func_indirect( func_t * pFunc ) {
    pFunc();
}
void func_none( func_t * pFunc ) {
}
int main( int argc, const char * argv[] ) {
    long long loop;
    const char * pMode;

    double prev = getTime();
    switch ( argc ) {
    case 1:
        pMode = "indirect";
        for ( loop = 0; loop < 1000 * 1000 * 1000 * 2; loop++ ) {
            func_indirect( sub );
        }
        break;
    case 2:
        pMode = "direct";
        for ( loop = 0; loop < 1000 * 1000 * 1000 * 2; loop++ ) {
            func_direct( sub );
        }
        break;
    case 3:
        pMode = "none";
        for ( loop = 0; loop < 1000 * 1000 * 1000 * 2; loop++ ) {
            func_none( sub );
        }
        break;
    }
    printf( "%s: time = %g\n", pMode, getTime() - prev );
    return 0;
}
