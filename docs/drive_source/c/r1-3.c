#include <stdio.h>
int main(void)
{
	double h,v,s;

	scanf("%lf%lf",&h ,&v);
	s=h*v/2.00;
	printf("高さ      =%5.1f\n",h);
	printf("底辺の長さ=%5.1f\n",v);
	printf("面積　    =%5.1f\n",s);
	return 0;
}
