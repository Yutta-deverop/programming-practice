#include <stdio.h>
int main(void)
{
	int nasi,ringo,s;

	scanf("%d%d",&nasi,&ringo);
	s=50*nasi+190*ringo;
	printf("梨　=%4d 個\n",nasi);
	printf("林檎　=%4d 個\n",ringo);
	printf("総額　=%4d 円\n",s);

	return 0;
}
