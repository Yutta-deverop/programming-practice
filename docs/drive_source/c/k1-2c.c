#include <stdio.h>
int main(void)
{
	int a,b,c,d,e,f;//(順に水槽,バケツ,水槽の容量,バケツの容量,バケツの個数,最後のバケツの容量)

	scanf("%d%d",&a,&b);
	c=a*a*a*1000000;//水槽の容量(100a^3)
	d=b*b*b;//バケツの容量(b^3)
	e=c/d;//バケツの個数(水槽の容量/バケツの容量)
	f=c-d*e;//最後のバケツの容量(水槽の容量-バケツの容量*バケツの個数)

	printf("水槽の1辺の長さ　  =%7d m\n",a);
	printf("水槽の容量　　　   =%7d cc\n",c);
	printf("バケツの1辺の長さ  =%7d cm\n",b);
	printf("バケツの容量　　   =%7d cc\n",d);
	printf("バケツの個数　 　  =%7d 杯\n",e);
	printf("最後のバケツの容量 =%7d cc\n",f);
	return 0;
}
	
