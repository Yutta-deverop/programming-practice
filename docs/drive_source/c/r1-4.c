#include <stdio.h>//printf関数を使うときに使う
#include <math.h>//sin,cosなどの標準関数を使う時に使う

int main(void)
{
	double pi=3.1416;
	double y1 ,y2 ,y3;

	y1=sin(0.0);
	y2=sin(pi/6.0);
	y3=sin(pi/3.0);
	printf("sin(0.0)   =%6.3f\n" ,y1);
	printf("sin(pi/6.0)=%6.3f\n" ,y2);
	printf("sin(pi/3.0)=%6.3f\n" ,y3);
	printf("sin(pi/2.0)=%6.3f\n" ,sin(pi/2.0));
	printf("sin(pi)    =%6.3f\n" ,sin(pi));
	printf("sin(pi*2.0)=%6.3f\n" ,sin(2.0*pi));
	return 0;
}
