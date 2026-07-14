import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client';
import { getErrorMessage } from '../api/errors';
import { LoadingState, EmptyState, ErrorState } from '../components/StateMessage';
import RestaurantCard from '../components/RestaurantCard';

export default function RestaurantListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page') || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [restaurants, setRestaurants] = useState([]);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus('loading');
    client
      .get('/restaurants', { params: { search, page, per_page: 12 } })
      .then((response) => {
        setRestaurants(response.data.data);
        setMeta(response.data.meta);
        setStatus('success');
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }, [search, page]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearchParams(searchInput ? { search: searchInput } : {});
  }

  function goToPage(nextPage) {
    const params = { page: String(nextPage) };
    if (search) params.search = search;
    setSearchParams(params);
  }

  return (
    <div className="container">
      <h1>Restaurants</h1>

      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24, maxWidth: 420 }}>
        <input
          type="search"
          placeholder="Search restaurants…"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
          }}
        />
        <button type="submit" className="btn btn-secondary">
          Search
        </button>
      </form>

      {status === 'loading' && <LoadingState label="Loading restaurants…" />}
      {status === 'error' && <ErrorState label={error} />}
      {status === 'success' && restaurants.length === 0 && (
        <EmptyState label={search ? `No restaurants match "${search}".` : 'No restaurants are available right now.'} />
      )}

      {status === 'success' && restaurants.length > 0 && (
        <>
          <div className="grid">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>

          {meta && meta.last_page > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={meta.current_page <= 1}
                onClick={() => goToPage(meta.current_page - 1)}
              >
                Previous
              </button>
              <span style={{ alignSelf: 'center', fontSize: 14 }}>
                Page {meta.current_page} of {meta.last_page}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => goToPage(meta.current_page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
