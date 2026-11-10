#include <stdio.h>
int main(void)
{
	double a,b,c,d,e,v,h,s;//a＝x1,b＝x2,c＝x3,d=y1=y2,e＝y3,

	scanf("%lf%lf%lf%lf%lf",&a ,&b ,&c ,&d ,&e);

	v=b-a;//底辺
	h=e-d;//高さ
	s=v*h/2.00;
	
	printf("X1＝%4.1f",a);
	printf("　　Y1＝%4.1f\n",d);//\nを１つ抜かすことでX1とY1を同じ行で表示できる。
	printf("X2＝%4.1f",b);
	printf("　　Y2＝%4.1f\n",d);
	printf("X3＝%4.1f",c);
	printf("　　Y3＝%4.1f\n",e);
	printf("面積＝%5.1f\n",s);

	return 0;
}
