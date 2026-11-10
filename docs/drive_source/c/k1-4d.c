#include <stdio.h>
#include <math.h>

int main(void)
{
	double pi=3.1416;
	double a ,b ,c ,d, e, f ,g ,h ,i ,j ,k;

	scanf("%lf",&a);

	b=0.0;
	c=a*sqrt(1-sin(2*pi*b/a));
	
	d=1.2;
	e=a*sqrt(1-sin(2*pi*d/a));
	
	f=2.4;
	g=a*sqrt(1-sin(2*pi*f/a));

	h=3.6;
	i=a*sqrt(1-sin(2*pi*h/a));

	j=4.8;
	k=a*sqrt(1-sin(2*pi*j/a));
	
	printf("a=%4.1f\n" ,a);
	printf("x=%4.1f" ,b);
	printf("　y=%6.3f\n" ,c);
	printf("x=%4.1f" ,d);
	printf("　y=%6.3f\n" ,e);
	printf("x=%4.1f" ,f);
	printf("　y=%6.3f\n" ,g);
	printf("x=%4.1f" ,h);
	printf("　y=%6.3f\n" ,i);
	printf("x=%4.1f" ,j);
	printf("　y=%6.3f\n" ,k);

	return 0;
}
