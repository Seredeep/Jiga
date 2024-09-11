import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
  IonButton, IonIcon, IonRefresher, IonRefresherContent, IonSpinner,
  IonInfiniteScroll, IonInfiniteScrollContent, IonSearchbar, IonSelect, 
  IonSelectOption, IonItem, IonLabel, IonInput, IonDatetime, IonList
} from '@ionic/react';
import { openOutline, filterOutline } from 'ionicons/icons';

const NewsCard = ({ news }) => (
  <IonCard>
    <img alt={news.title} src={`https://source.unsplash.com/random/400x200?${encodeURIComponent(news.title)}`} />
    <IonCardHeader>
      <IonCardSubtitle>{new Date(news['published date']).toLocaleDateString()} - {news.publisher.title}</IonCardSubtitle>
      <IonCardTitle>{news.title}</IonCardTitle>
    </IonCardHeader>
    <IonCardContent>{news.description}</IonCardContent>
    <IonButton fill="clear" href={news.url} target="_blank" rel="noopener noreferrer">
      Read More
      <IonIcon slot="end" icon={openOutline} />
    </IonButton>
  </IonCard>
);

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    topic: '',
    location: '',
    startDate: '',
    endDate: '',
    excludeWebsites: ''
  });

  const fetchNews = async (pageNum = 1, refresh = false) => {
    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        ...filters,
        startDate: filters.startDate ? new Date(filters.startDate).toISOString() : '',
        endDate: filters.endDate ? new Date(filters.endDate).toISOString() : ''
      }).toString();
      
      const response = await fetch(`http://localhost:5000/news?${queryParams}`);
      const data = await response.json();
      if (refresh) {
        setNews(data);
      } else {
        setNews(prevNews => [...prevNews, ...data]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(1,true);
  }, [filters]);

  const handleRefresh = async (event) => {
    setPage(1);
    await fetchNews(1, true);
    event.detail.complete();
  };

  const loadMore = async (event) => {
    const nextPage = page + 1;
    await fetchNews(nextPage);
    setPage(nextPage);
    event.target.complete();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [key]: value }));
    setPage(1);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ionic News Feed</IonTitle>
          <IonButton slot="end" onClick={() => setShowFilters(!showFilters)}>
            <IonIcon icon={filterOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {showFilters && (
          <IonList>
            <IonItem>
              <IonSearchbar
                value={filters.keyword}
                onIonChange={e => handleFilterChange('keyword', e.detail.value)}
                placeholder="Search news"
              />
            </IonItem>
            <IonItem>
              <IonLabel>Topic</IonLabel>
              <IonSelect value={filters.topic} onIonChange={e => handleFilterChange('topic', e.detail.value)}>
                <IonSelectOption value="">All</IonSelectOption>
                <IonSelectOption value="WORLD">World</IonSelectOption>
                <IonSelectOption value="NATION">Nation</IonSelectOption>
                <IonSelectOption value="BUSINESS">Business</IonSelectOption>
                <IonSelectOption value="TECHNOLOGY">Technology</IonSelectOption>
                <IonSelectOption value="ENTERTAINMENT">Entertainment</IonSelectOption>
                <IonSelectOption value="SPORTS">Sports</IonSelectOption>
                <IonSelectOption value="SCIENCE">Science</IonSelectOption>
                <IonSelectOption value="HEALTH">Health</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Location</IonLabel>
              <IonInput
                value={filters.location}
                onIonChange={e => handleFilterChange('location', e.detail.value)}
                placeholder="Enter location"
              />
            </IonItem>
            <IonItem>
              <IonLabel>Start Date</IonLabel>
              <IonDatetime
                value={filters.startDate}
                onIonChange={e => handleFilterChange('startDate', e.detail.value)}
              />
            </IonItem>
            <IonItem>
              <IonLabel>End Date</IonLabel>
              <IonDatetime
                value={filters.endDate}
                onIonChange={e => handleFilterChange('endDate', e.detail.value)}
              />
            </IonItem>
            <IonItem>
              <IonLabel>Exclude Websites</IonLabel>
              <IonInput
                value={filters.excludeWebsites}
                onIonChange={e => handleFilterChange('excludeWebsites', e.detail.value)}
                placeholder="e.g., cnn.com,bbc.com"
              />
            </IonItem>
          </IonList>
        )}

        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {loading && news.length === 0 ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        ) : (
          news.map((item, index) => <NewsCard key={index} news={item} />)
        )}

        <IonInfiniteScroll onIonInfinite={loadMore}>
          <IonInfiniteScrollContent loadingText="Loading more news..."></IonInfiniteScrollContent>
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  );
};

export default NewsFeed;