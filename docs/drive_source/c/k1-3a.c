#include <stdio.h>
int main(void)
{
	double a,b,h,s;//a=上底.b=下底,h=高さ,s=面積

	scanf("%lf%lf%lf" ,&a ,&b ,&h);

	s=(a+b)*h/2.00;//台形の面積:(上底+下底)×高さ÷2

	printf("上底＝%5.1f\n",a);
	printf("下底＝%5.1f\n",b);
	printf("高さ＝%5.1f\n",h);
	printf("面積＝%5.1f\n",s);

	return 0;
}
	
