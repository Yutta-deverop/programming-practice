#include <stdio.h>
int main(void)
{
	double a ,b ,c;//a＝抵抗R1,b＝抵抗R2,c＝合成抵抗R

	scanf("%lf%lf" ,&a ,&b);

	c=a*b/(a+b);//合成抵抗 和分の積

	printf("R1　　　＝%7.3fΩ\n",a);
	printf("R2　　　＝%7.3fΩ\n",b);
	printf("合成抵抗＝%7.3fΩ\n",c);

	return 0;
}
