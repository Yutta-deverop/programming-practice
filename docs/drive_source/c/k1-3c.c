#include <stdio.h>
int main(void)
{
	double a,n,b;//a＝林檎の個数,b＝人数,b＝1人当たりの個数

	scanf("%lf%lf" ,&a ,&n);

	b=a/n;

	printf("林檎の個数＝%3.1f\n",a);
	printf("人数　　　＝%3.1f\n",n);
	printf("1人当たり ＝%9.6f\n",b);

	return 0;
}
