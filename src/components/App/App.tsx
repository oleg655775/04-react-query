import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import ReactPaginate from 'react-paginate';
import type { Movie } from '../../types/movie';
import { fetchMovies } from '../../services/movieService';
import SearchBar from '../SearchBar/SearchBar';
import toast, { Toaster } from 'react-hot-toast';
import MovieGrid from '../MovieGrid/MovieGrid';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import MovieModal from '../MovieModal/MovieModal';
import css from './App.module.css';

function App() {
  const [movieName, setMovieName] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const closeModal = () => {
    setSelectedMovie(null);
  };

  const {
    data: moviesData,
    isLoading,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ['movie', movieName, currentPage],
    queryFn: () => fetchMovies(movieName, currentPage),
    enabled: movieName !== '',
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (moviesData?.results && moviesData.results.length < 1) {
      toast.error('No movies found for your request.');
    }
  }, [moviesData]);

  const handleSearch = (movie: string) => {
    setMovieName(movie);
    setCurrentPage(1);
  };

  const onSelectHandler = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  return (
    <>
      <Toaster />
      <SearchBar onSubmit={handleSearch} />
      {isError && <ErrorMessage />}
      {isLoading && <Loader />}
      {isSuccess && (
        <>
          {moviesData.total_pages > 1 && (
            <ReactPaginate
              pageCount={moviesData.total_pages}
              pageRangeDisplayed={5}
              marginPagesDisplayed={1}
              onPageChange={({ selected }) => setCurrentPage(selected + 1)}
              forcePage={currentPage - 1}
              containerClassName={css.pagination}
              activeClassName={css.active}
              nextLabel="→"
              previousLabel="←"
            />
          )}
          <MovieGrid onSelect={onSelectHandler} movies={moviesData.results} />
        </>
      )}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={closeModal} />
      )}
    </>
  );
}

export default App;
