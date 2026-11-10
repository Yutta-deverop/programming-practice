#include <stdio.h>
#include <math.h>

int main(void)
{
	double pi=3.1416;
	double a ,b ,c ,d ,e;

	a=sin(-pi/3.0)/cos(-pi/3.0);//tan(-π/3)
	b=sin(-pi/6.0)/cos(-pi/6.0);//tan(-π/6)
	c=sin(0.0)/cos(0.0);//tan(0)
	d=sin(pi/6.0)/cos(pi/6.0);//tan(π/6)
	e=sin(pi/3.0)/cos(pi/3.0);//tan(π/3)
	
	printf("tan(-pi/3.0)=%7.3f\n" ,a);
	printf("tan(-pi/6.0)=%7.3f\n" ,b);
	printf("tan(0.0)　　=%7.3f\n" ,c);
	printf("tan(pi/6.0) =%7.3f\n" ,d);
	printf("tan(pi/3.0) =%7.3f\n" ,e);

	return 0;
}
