#include <stdio.h>
int main(void)
{
	double r,h,v;//r＝半径,h＝高さ,v＝体積

	scanf("%lf%lf" ,&r ,&h);

	v=r*r*3.1416*h;

	printf("半径＝%5.1f\n",r);
	printf("高さ＝%5.1f\n",h);
	printf("体積＝%5.1f\n",v);

	return 0;
}
