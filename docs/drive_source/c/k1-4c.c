#include <stdio.h>
#include <math.h>

int main(void)
{
	double a ,b ,c ,d ,e;

	a=log(0.5)/log(10);//log10(x)=log(x)/log(10)←底の変換公式を用いた書き方をする。
	b=log(1.0)/log(10);
	c=log(10.0)/log(10);
	d=log(100.0)/log(10);
	e=log(1000.0)/log(10);

	printf("log10(   0.5)=%6.3f\n" ,a);
	printf("log10(   1.0)=%6.3f\n" ,b);
	printf("log10(  10.0)=%6.3f\n" ,c);
	printf("log10( 100.0)=%6.3f\n" ,d);
	printf("log10(1000.0)=%6.3f\n" ,e);

	return 0;
}
