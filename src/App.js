import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import className from 'classnames';
import './App.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner, faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

library.add(faSpinner);

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = 100;

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

// var list = [
//     {
//         title: 'React',
//         url: 'https:///reactjs.org',
//         author: 'Jordan Walke',
//         num_comments: 3,
//         points: 4,
//         objectID: 0
//     },
//     {
//         title: 'Redux',
//         url: 'https:///redux.org',
//         author: 'Dan Abrmov, Andrew Clark',
//         num_comments: 2,
//         points: 5,
//         objectID: 1
//     },
// ];

// const isSearched = searchTerm => (item) =>
//     item.title.toLowerCase().includes(searchTerm.toLowerCase());

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse()
};

class App extends Component {
  _isMounted = false;

  constructor(props) {
      super(props);
      this.state = {
          results: null,
          searchKey: '',
          searchTerm: DEFAULT_QUERY,
          error: null,
          isLoading: true,
      };
      this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
      this.setSearchTopStories = this.setSearchTopStories.bind(this);
      this.onSearchChange = this.onSearchChange.bind(this);
      this.onSearchSubmit = this.onSearchSubmit.bind(this);
      this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
      this.onDismiss = this.onDismiss.bind(this);
  }


  needsToSearchTopStories(searchTerm) {
      return !this.state.results[searchTerm]
  }

  setSearchTopStories(result) {
      const { hits, page } = result;
      const { searchKey, results } = this.state;

      const oldHits = results && results[searchKey]
          ? results[searchKey].hits
          : [];

      const updatedHits = [
          ...oldHits,
          ...hits
      ];

      this.setState({
          results: {
              ...results,
              [searchKey]: {hits: updatedHits, page}
          },
          isLoading: false
      });
  }

  fetchSearchTopStories(searchTerm, page=0) {
      this.setState({ isLoading: true });

      axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
        .then(result => this._isMounted && this.setSearchTopStories(result.data))
        .catch(error => this._isMounted && this.setState({ error }));
  }

  componentDidMount() {
      this._isMounted = true;

      const  { searchTerm } = this.state;
      this.setState({ searchKey: searchTerm });
      this.fetchSearchTopStories(searchTerm);
  }

  componentWillUnmount() {
      this._isMounted = false;
  }

  onSearchChange(event) {
      this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit (event) {
      const { searchTerm } = this.state;
      this.setState({ searchKey: searchTerm });

      if (this.needsToSearchTopStories(searchTerm)) {
          this.fetchSearchTopStories(searchTerm);
      }
      event.preventDefault();
  }

  onDismiss(id) {
      const { searchKey, results } = this.state;
      const { hits, page } = results[searchKey];

      const isNotId = item => item.objectID !== id;
      const updatedHits = hits.filter(isNotId);

      this.setState({
          results: {
              ...results,
              [searchKey]: {hits: updatedHits, page}
          }
      });
  }

  render() {
    const {
        searchTerm,
        results,
        searchKey,
        error,
        isLoading,
    } = this.state;
    const page = (
        results &&
        results[searchKey] &&
        results[searchKey].page
    ) || 0;

    const list = (
        results &&
        results[searchKey] &&
        results[searchKey].hits
    ) || [];

    return (
      <div className="page">
          <div className="interactions">
              <Search
                value={searchTerm}
                onChange={this.onSearchChange}
                onSubmit={this.onSearchSubmit}
              >
                  Search Submit
              </Search>
          </div>
          {error
              ? <div className="interactions">
                  <p>Something went wrong.</p>
                </div>
              : <Table
                  list={list}
                  onDismiss={this.onDismiss}
                />
          }
          <div className="interactions">
              {/*<ButtonWithLoading*/}
                  {/*onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}*/}
                  {/*isLoading={isLoading}*/}
              {/*>*/}
                  {/*More*/}
              {/*</ButtonWithLoading>*/}
              {
                  isLoading
                      ? <Loading />
                      : <Button
                          onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
                        >
                          More
                        </Button>
              }
          </div>
      </div>
    );
  }
}

class Search extends Component {
    componentDidMount() {
        if (this.input) {
            this.input.focus();
        }
    }

    render() {
        const {
            value,
            onChange,
            onSubmit,
            children
        } = this.props;

        return (
            <form onSubmit={onSubmit}>
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    ref={el => this.input = el}
                />
                <button type="submit">
                    {children}
                </button>
            </form>
        );
    }
}

    Search.propsType = {
      onChange: PropTypes.func.isRequired,
      onsubmit: PropTypes.func.isRequired,
    };

    Search.defaultProps = {
      value: '',
      children: 'Submit'
    };

class Table extends Component {
    constructor(props) {
        super(props);

        this.state = {
          sortKey: 'NONE',
          isSortReverse: false,
        };
        this.onSort = this.onSort.bind(this);
    }

    onSort(sortKey) {
        const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
        this.setState({ sortKey, isSortReverse });
    }
    render() {
        const {
            list,
            onDismiss
        } = this.props;

        const {
            sortKey,
            isSortReverse
        } = this.state;

        const sortedList = SORTS[sortKey](list);
        const reverseSortedList = this.state.isSortReverse
            ? sortedList.reverse()
            : sortedList;

        return (
          <div className="table">
            <div className="table-header">
                <span style={{ width: '40%' }}>
                    <Sort
                        sortKey={'TITLE'}
                        onSort={this.onSort}
                        activeSortKey={sortKey}
                        isSortReverse={isSortReverse}
                    >
                        Title
                    </Sort>
                </span>
                <span style={{ width: '30%' }}>
                    <Sort
                        sortKey={'AUTHOR'}
                        onSort={this.onSort}
                        activeSortKey={sortKey}
                        isSortReverse={isSortReverse}
                    >
                        Author
                    </Sort>
                </span>
                <span style={{ width: '10%' }}>
                    <Sort
                        sortKey={'COMMENTS'}
                        onSort={this.onSort}
                        activeSortKey={sortKey}
                        isSortReverse={isSortReverse}
                    >
                        Comments
                    </Sort>
                </span>
                <span style={{ width: '10%' }}>
                    <Sort
                        sortKey={'POINTS'}
                        onSort={this.onSort}
                        activeSortKey={sortKey}
                        isSortReverse={isSortReverse}
                    >
                        Points
                    </Sort>
                </span>
                <span style={{ width: '10%' }}>
                    Archive
                </span>
            </div>
            {reverseSortedList.map(item =>
                <div key={item.objectID} className="table-row">
                  <span style={{ width: '40%' }}>
                    <a href={item.url}> {item.title}</a>
                  </span>
                  <span style={{ width: '30%' }}>
                     {item.author}
                  </span>
                  <span style={{ width: '10%' }}>
                     {item.num_comments}
                  </span>
                  <span style={{ width: '10%' }}>
                     {item.points}
                  </span>
                  <span style={{ width: '10%' }}>
                      <Button
                          onClick={() => onDismiss(item.objectID)}
                          className="button-inline"
                      >
                          Dismiss
                      </Button>
                  </span>
                </div>
            )}
          </div>
        );
    }
}


    Table.propType = {
      list: PropTypes.arrayOf(
          PropTypes.shape({
              objectID: PropTypes.string.isRequired,
              author: PropTypes.string,
              url: PropTypes.string,
              num_comments: PropTypes.number,
              points: PropTypes.number,
          })
      ).isRequired,
      onDismiss: PropTypes.func.isRequired,
    };

    Table.defaultProps = { sortKey: '' };

const Button = ({ className, onClick, children }) =>
    <button
        className={className}
        onClick={onClick}
        type="button"
    >
    {children}
    </button>;

    Button.propTypes = {
        onClick: PropTypes.func.isRequired,
        children: PropTypes.node.isRequired,
    };

    Button.defaultProps = {
        className: '',
    };

const Sort = ({
                  sortKey,
                  activeSortKey,
                  onSort,
                  children,
                  isSortReverse
}) => {
    const sortClass = className(
        'button-inline',
        { 'button-active': sortKey === activeSortKey }
    );

    return (
        <button
        onClick={()=> {onSort(sortKey)}}
        className={sortClass}
        >
          {children} <SortArrow
                       sortKey={ sortKey }
                       activeSortKey={ activeSortKey }
                       isSortReverse={ isSortReverse }
                     />
        </button>
    );
};

const SortArrow = ({ sortKey, activeSortKey, isSortReverse }) =>
    sortKey === activeSortKey
    ? isSortReverse
      ? <FontAwesomeIcon icon={faArrowUp} />
      : <FontAwesomeIcon icon={faArrowDown} />
    : null;

const Loading = () =>
    <div>
        Loading ...  <FontAwesomeIcon icon="spinner" spin />
    </div>;


const WithLoading = (Component) => (isLoading, ...rest) =>
    isLoading
    ? <Loading />
    : <Component {...rest} />;

const ButtonWithLoading = WithLoading(Button);

export default App;

export { Search, Button, Table};



  // render() {
  //   const helloWorld = 'Welcome to the Road to learn React';
  //   const person = {
  //       'name': 'Andriy',
  //       'second_name': 'Sorochan'
  //   };
  //   const { name, second_name } = person;
  //   const { searchTerm, list } = this.state;
  //   return (
  //     <div className="App">
  //         <h2>{helloWorld}</h2>
  //         <h3>{name} {second_name}</h3>
  //     <form>
  //         <input
  //             type="text"
  //             onChange={this.onSearchChange}
  //         />
  //     </form>
  //     {list.filter(isSearched(searchTerm)).map(item => {
  //         const onHandlerDismiss = () => this.onDismiss(item.objectID);
  //         return (
  //             <div key={item.objectID}>
  //               <span>
  //                 <a href={item.url}> {item.title}</a>
  //               </span>
  //               <span> {item.author}</span>
  //               <span> {item.num_comments}</span>
  //               <span> {item.points}  </span>
  //               <span>
  //                 <button
  //                   onClick={onHandlerDismiss}
  //                   value={searchTerm}
  //                   type='button'>
  //                     Dismiss
  //                 </button>
  //               </span>
  //             </div>
  //     )})}
  //     </div>
  //   );
  // }
// }
//
// export default App;

