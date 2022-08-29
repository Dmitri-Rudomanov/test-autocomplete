import React, { Component } from 'react';
import './Autocomplete.css';
import qs from 'qs';
import Loader from 'components/Loader/Loader';

function debouncePromise(fn, time) {
  let timerId = undefined;

  return function (...args) {
    if (timerId) {
      clearTimeout(timerId);
    }

    return new Promise(resolve => {
      timerId = setTimeout(() => resolve(fn(...args)), time);
    });
  };
}

const debouncedFetch = debouncePromise(fetch, 300);
const repoUrl = `https://api.github.com/search/repositories`;
const userUrl = `https://api.github.com/search/users`;

export class Autocomplete extends Component {
  state = {
    activeOption: 0,
    filteredOptions: [],
    showOptions: false,
    userInput: '',
    items: [],
    isLoading: false,
    Error: false,
  };

  onChange = e => {
    this.setState({
      activeOption: 0,
      showOptions: true,
      userInput: e.currentTarget.value,
    });
  };
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.state.userInput &&
      prevState.userInput !== this.state.userInput &&
      this.state.userInput.length >= 3
    ) {
      this.createGitHubReposPlugin();
    }
    return;
  }
  createGitHubReposPlugin = async () => {
    const repoQueryParams = qs.stringify({
      ...{ per_page: 25 },
      q: this.state.userInput,
    });
    const userQueryParams = qs.stringify({
      ...{ per_page: 25 },
      q: this.state.userInput,
    });
    const repoEndpoint = [repoUrl, repoQueryParams].join('?');
    const userEndpoint = [userUrl, userQueryParams].join('?');
    try {
      this.setState({ isLoading: true });
      const response = await debouncedFetch(repoEndpoint);
      const repositories = await response.json();
      const userResponse = await debouncedFetch(userEndpoint);
      const users = await userResponse.json();
      if (repositories.items) {
        this.setState({ items: [...repositories.items] });
      }
      if (users.items) {
        const usersObj = users.items.map(item => {
          const obj = { ...item, name: item.login };
          return obj;
        });
        this.setState(state => ({ items: [...state.items, ...usersObj] }));
      }
      this.setState({
        filteredOptions: [...this.state.items].sort(function (a, b) {
          return a.name.localeCompare(b.name);
        }),
      });
      this.setState({ isLoading: false });
    } catch (error) {
      console.log(error);
      this.setState({ Error: true });
      this.setState({ isLoading: false });
    }
  };

  startsCount(item) {
    const stars = new Intl.NumberFormat('en-US').format(item.stargazers_count);
    return stars;
  }

  onClick = e => {
    this.setState({
      activeOption: 0,
      userInput: e.currentTarget.id,
    });
  };
  onKeyDown = e => {
    const { activeOption, filteredOptions } = this.state;

    if (e.code === 'Enter') {
      this.setState({
        activeOption: 0,
        userInput:
          filteredOptions[activeOption].full_name ||
          filteredOptions[activeOption].login,
      });
    } else if (e.code === 'ArrowUp') {
      if (activeOption === 0) {
        return;
      }
      this.setState({ activeOption: activeOption - 1 });
    } else if (e.code === 'ArrowDown') {
      if (activeOption === filteredOptions.length - 1) {
        console.log(activeOption);
        return;
      }
      this.setState({ activeOption: activeOption + 1 });
    }
  };

  render() {
    const {
      onChange,
      onClick,
      onKeyDown,

      state: {
        activeOption,
        filteredOptions,
        showOptions,
        userInput,
        isLoading,
        Error,
      },
    } = this;
    let optionList;
    if (showOptions && userInput.length >= 3) {
      if (filteredOptions.length && !isLoading) {
        optionList = (
          <ul className="autocomplete-options">
            {filteredOptions.map((option, index) => {
              let className;
              if (index === activeOption) {
                className = 'option-active';
              }
              if (option.type) {
                return (
                  <li
                    className={className}
                    key={option.id}
                    onClick={onClick}
                    id={option.login}
                  >
                    User
                    <div className="autocomplete-option__content">
                      <div className="autocomplete-option__icon">
                        <img
                          src={option.avatar_url}
                          alt={option.login}
                          width="40"
                          height="40"
                        />
                      </div>
                      <div className="autocomplete-option__content-body">
                        <div className="autocomplete-option__content-title">
                          <div className="autocomplete-option__content-name">
                            {option.login}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="autocomplete-option__actions">
                      <a
                        href={option.url}
                        target="_blank"
                        className="autocomplete-option__actions-btn"
                        style={{ pointerEvents: 'none' }}
                        rel="noreferrer"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="currentColor"
                        >
                          <path d="M18.984 6.984h2.016v6h-15.188l3.609 3.609-1.406 1.406-6-6 6-6 1.406 1.406-3.609 3.609h13.172v-4.031z" />
                        </svg>
                      </a>
                    </div>
                  </li>
                );
              }
              if (!option.type) {
                return (
                  <li
                    className={className}
                    key={option.id}
                    onClick={onClick}
                    id={option.full_name}
                  >
                    <div className="autocomplete-option__wrapper">
                      <div className="autocomplete-option__content">
                        <div className="autocomplete-option__icon">
                          <img
                            src={option.owner.avatar_url}
                            alt={option.full_name}
                            width="40"
                            height="40"
                          />
                        </div>
                        <div className="autocomplete-option__content-body">
                          <div className="autocomplete-option__content-title">
                            <div className="autocomplete-option__content-name">
                              {option.full_name}
                            </div>
                            <div className="autocomplete-option__content-stars">
                              <svg
                                aria-label={`${this.startsCount(option)} stars`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>{' '}
                              <span
                                aria-hidden="true"
                                style={{
                                  fontSize: '0.8em',
                                  lineHeight: 'normal',
                                }}
                              >
                                {this.startsCount(option)}
                              </span>
                            </div>
                          </div>
                          <div className="autocomplete-option__content-description">
                            {option.description}
                          </div>
                        </div>
                      </div>
                      <div className="autocomplete-option__actions">
                        <a
                          href={option.url}
                          target="_blank"
                          className="autocomplete-option__actions-btn"
                          style={{ pointerEvents: 'none' }}
                          rel="noreferrer"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            fill="currentColor"
                          >
                            <path d="M18.984 6.984h2.016v6h-15.188l3.609 3.609-1.406 1.406-6-6 6-6 1.406 1.406-3.609 3.609h13.172v-4.031z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </li>
                );
              }
              return <li></li>;
            })}
          </ul>
        );
      } else if (!filteredOptions.length && !isLoading) {
        optionList = (
          <div className="no-options">
            <em>
              Sorry,there is no option mathcing yor search query {userInput}!
            </em>
          </div>
        );
      } else if (Error && !isLoading) {
        <div className="error">
          <em>
            Sorry,something went wrong. Please reload the page and try again!
          </em>
        </div>;
      } else {
        optionList = <Loader />;
      }
    }
    if (showOptions && userInput.length < 3) {
      optionList = (
        <div className="validation-err">Enter 3 or more characters</div>
      );
    }
    return (
      <React.Fragment>
        <div className="autocomplete">
          Search for any GitHub user or repository
        </div>
        <div className="autocomplete-search">
          <input
            type="text"
            className="autocomplete-search-box"
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={userInput || ''}
          />
          <input type="submit" value="" className="autocomplete-search-btn" />
        </div>
        {optionList}
      </React.Fragment>
    );
  }
}
