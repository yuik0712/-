#include <stdio.h>
#include <string.h>

#define MAX 1000001  // 최대 자리수는 1,000,000자리 + '\0'

void reverse(char * str) {
    int len = strlen(str);
    for (int i=0; i<len/2; i++) {
        char temp = str[i];
        str[i] = str[len-i-1];
        str[len-i-1] = temp;
    }
}

int main() {
    char A[MAX], B[MAX], result[MAX + 1] = {0};
    int carry = 0,i;

    // 두 수를 입력 받음 (문제에 두정수를 입력해야 한다는 조건이 있음!)
    scanf("%s %s", A, B);

    // 문자열을 뒤집어 덧셈을 낮은 자릿수부터 할 수 있도록 함.
    reverse(A);
    reverse(B);

    // A와 B의 길이를 각각 구함
    int lenA = strlen(A);
    int lenB = strlen(B);
    int maxLen = lenA > lenB ? lenA:lenB;

    // 각 자릿수를 더함
    for (i=0; i<maxLen;i++) {
        int numA = i<lenA ? A[i]-'0':0; // A의 현재 자리 숫자
        int numB = i<lenB ? B[i]-'0':0; // B의 현재 자리 숫자
        int sum = numA + numB + carry; // 자리 숫자 합과 올림값 계산

        result[i] = (sum % 10) + '0'; // 자리값을 저장
        carry = sum/10; // 올림값 저장
    }

    // 마지막으로 남은 올림값이 있으면 추가
    if (carry) {
        result[i++] = carry+'0';
    }

    // 결과를 원래 순서대로 돌려놓음
    result[i] = '\0'; // 문자열의 끝을 표시
    reverse(result);

    // 결과 출력 
    printf("%s\n", result);

    return 0;
}
