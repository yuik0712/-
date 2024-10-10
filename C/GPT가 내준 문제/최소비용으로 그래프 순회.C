#include <stdio.h>
#include <limits.h>

#define MAX_N20 // 노드의 최대 수. (메모리 제한 때문에 20으로 설정하였음)
#define INF INT_MAX // 무한대 정의

int n,m; 
int graph[MAX_N][MAX_N]; // 인접 행렬로 그래프 저장
int dp[1<<MAX_N][MAX_N]; // 동적 계획법을 위한 배열

// 최소값을 반환하는 함수
int min(int a, int b) {
    return a < b ? a : b;
}

// 외판원 순회 문제 해결 함수 (동적 계획법)
int tsp(int state, int pos) {
    // 모든 노드를 다 방문했다면 다시 출발점으로 가는 비용을 반환
    if (state == (1<<n)-1) {
        // 돌아가는 길이 없을 경우
        if (graph[pos][0] == 0) return INF; 
        return graph[pos][0];
    }

    // 이미 계산된 값이 있다면 그 값을 반환
    if (dp[state][pos] != -1) {
        return dp[state][pos];
    }

    dp[state][pos] = INF;

    // 모든 노드를 확인하며 순회
    for (int text = 0; next < n; next++) {
        // 방문하지 않은 노드를 찾고
        if((state & (1<<next)) == 0 && graph[pos][next]!=0) {
            // 그 노드를 방문하는 비용을 계산
            int newCost = graph[pos][next] + tsp(state|(1<<next), next);
            dp[state][pos] = min(dp[state][pos], newCost);
        }
    }

    return dp[state][pos];
}

int main() {
    // 입력 받기
    scanf("%d %d", &n, &m);

    // 그래프 초기화 (경로가 없을 경우를 대비하여 모든 값을 0으로 초기화)
    for (int i = 0; i<n; i++) {
        for (int j = 0; j<n; j++) {
            if (i != j) graph[i][j] = INF;
        }
    }

    // 간선 정보 입력
    for (int i = 0; i<m; i++) {
        int u, v, w;
        scanf("%d %d %d", &u, &v, &w);
        u--; v--; // 0부터 시작하도록 변환
        graph[u][v] = w;
        graph[v][u] = w;
    }

    // DP테이블 초기화 (-1로 초기화하여 아직 계산되지 않았음을 나타냄)
    for (int i = 0; i < (1<<n); i++) {
        for (int j = 0; j < n; j++) {
            dp[i][j] = -1;
        }
    }

    //외판원 순회 문제 시작 (0번 노드에서 시작)
    int result = tsp(1, 0);

    // 결과 출력 (불가능한 경우 -1 출력)
    if (result == INF) {
        printf("-1\n");
    } else {
        printf("%d\n", result);
    }

    return 0;
}
