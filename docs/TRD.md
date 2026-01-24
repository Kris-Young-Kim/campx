# 3. TRD (Technical Requirements Document)
**기술 스택:** Antigravity (Python Monolith) Strategy
**작성자:** 20년 차 캠핑 플랫폼 개발자

## 3.1. 시스템 아키텍처 (Architecture)
**"One Language, One Server, No Build Step"**
React/Next.js의 복잡성을 제거하고, Python의 강력함으로 프론트와 백엔드를 통합합니다.

*   **Backend Framework:** **Django** (또는 FastAPI)
    *   *선정 이유:* Admin 패널 기본 제공(캠핑장 사장님용), 강력한 ORM, Python AI 라이브러리와의 완벽한 결합(In-process 실행).
*   **Frontend Approach:** **Django Templates + HTMX + Alpine.js**
    *   *선정 이유 (Antigravity Core):* React의 복잡한 상태 관리나 빌드 과정 없이, 서버에서 렌더링 된 HTML을 HTMX로 부분 교체(SPA 느낌 구현). Alpine.js로 가벼운 인터랙션 처리.
*   **Styling:** **Tailwind CSS** (Django-compressor 활용)
*   **Database:** **PostgreSQL** (with `pgvector` extension)
    *   *선정 이유:* 관계형 데이터와 AI 벡터 데이터를 하나의 DB에서 처리.

## 3.2. 데이터 모델링 (Schema Design)

```python
# Django Models 예시 (가상 코드)

class UserProfile(models.Model):
    # 사용자 정보 및 AI 분석용 벡터
    health_condition = models.IntegerField() # 피로도
    preference_vector = VectorField(dimensions=3) # [Nature, Activity, Rest]

class CampsiteNode(models.Model):
    # 2.5D 맵 및 스케줄링용 노드
    name = models.CharField(max_length=100)
    node_type = models.CharField(choices=TYPE_CHOICES) # 화장실, 사이트, 체험존
    coordinates_3d = VectorField(dimensions=3) # (x, y, elevation) - 경사도 계산용
    feature_vector = VectorField(dimensions=3) # 이 장소의 특성

class Schedule(models.Model):
    # AI가 생성한 결과
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    timeline_json = models.JSONField() # 시간대별 동선 저장
    created_at = models.DateTimeField(auto_now_add=True)
```

## 3.3. 핵심 기능 구현 명세 (Implementation Details)

### A. AI 스케줄링 엔진 (In-Process Python)
*   별도의 AI 서버를 두지 않고, Django View/Service Layer에서 직접 `scikit-learn`이나 `numpy`를 호출.
*   **로직:**
    1.  사용자 입력값 수신.
    2.  `pgvector`의 **Cosine Similarity** 연산으로 가장 적합한 `CampsiteNode` 후보군 추출.
    3.  Python 로직으로 이동 거리(Distance)와 고도 차(Elevation Delta)에 따른 `피로도 페널티` 계산 (특허 수식 3 적용).
    4.  최적 경로(Traveling Salesman Problem 변형) 산출 후 템플릿 반환.

### B. 2.5D 인터랙티브 맵 (Hybrid)
*   무겁게 전체 3D 렌더링을 하지 않음.
*   **구현:** 배경은 고화질 항공샷(WebP) + 그 위에 **Three.js** 혹은 **SVG** 레이어를 얹어 핀(Pin)과 동선(Path)만 렌더링.
*   **인터랙션:** 핀 클릭 시 HTMX가 서버에 요청(`GET /api/node/12`) → 모달 HTML 조각을 받아와 화면에 표시.

### C. 배포 및 인프라 (DevOps)
*   **Container:** Docker Compose (Django + Postgres/pgvector + Redis).
*   **Hosting:** AWS Lightsail 또는 Railway (저비용, 고효율).
*   **CI/CD:** GitHub Actions (테스트 통과 시 자동 배포).

## 3.4. 개발 로드맵 (Milestone)
1.  **Week 1 (Skeleton):** Django 프로젝트 세팅, DB 설계(pgvector), 사장님용 Admin 페이지 구축.
2.  **Week 2 (Core AI):** 특허 알고리즘 Python 구현, 더미 데이터로 스케줄링 로직 검증.
3.  **Week 3 (UI/Map):** HTMX/Tailwind 기반 모바일 UI 개발, 2.5D 맵 연동.
4.  **Week 4 (Integration):** QR 체크인, 알림톡 연동, 현장 필드 테스트.

---

### 4. 20년 차 동료의 조언 (Conclusion)

"Antigravity 전략은 **'화려함'보다 '단단함'과 '속도'**를 선택한 것입니다. React로 폼 하나 만들 때, Django/HTMX로는 기능 3개를 완성할 수 있습니다.

MVP 단계에서 중요한 것은 '앱이 얼마나 예쁜가'가 아니라, **'AI가 짜준 스케줄이 진짜로 쓸만한가'**입니다. 이 스택은 그 본질(Back-end Logic)에 모든 리소스를 집중하게 해줄 겁니다. 멋진 선택입니다."