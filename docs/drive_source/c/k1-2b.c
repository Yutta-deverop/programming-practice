#include <stdio.h>
int main(void)
{
	int a, b , c , d;
	
	scanf("%d%d%d", &a , &b , &c );
	d = a - 9*b - 6*c ;
	printf("クラスの人数    =%2d人\n", a);
	printf("野球のチーム数  =%2dチーム\n", b);
	printf("バレーのチーム数=%2dチーム\n", c);
	printf("参加できない人数=%2d人\n", d);
	return 0;
}
