#include <stdio.h>
int main(void)
{
	int sanma,saba,kani,s;

	scanf("%d%d%d",&sanma,&saba,&kani);
	s=120*sanma+230*saba+210*kani;
	printf("秋刀魚\t=%4d 匹 \n",sanma);
	printf("鯖\t=%4d 匹 \n",saba);
	printf("蟹\t=%4d 匹 \n",kani);
	printf("総額\t=%4d 円 \n",s);

	return 0;
}
