import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createBook, deleteBook, getBooks, patchBook } from '../api/books-api'
import Auth from '../auth/Auth'
import { Book } from '../types/Book'

interface BooksProps {
  auth: Auth
  history: History
}

interface BooksState {
  books: Book[]
  newBookName: string
  newBookAuthor: string
  newBookReviewUrl: string
  loadingbooks: boolean
}

export class Books extends React.PureComponent<BooksProps, BooksState> {
  state: BooksState = {
    books: [],
    newBookName: '',
    newBookAuthor: '',
    newBookReviewUrl: '',
    loadingbooks: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookName: event.target.value })
  }

  handleAuthorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookAuthor: event.target.value })
  }

  handleReviewUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookReviewUrl: event.target.value })
  }

  onEditButtonClick = (bookId: string) => {
    this.props.history.push(`/books/${bookId}/edit`)
  }

  onBookCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newBook = await createBook(this.props.auth.getIdToken(), {
        name: this.state.newBookName,
        author: this.state.newBookAuthor,
        reviewUrl: this.state.newBookReviewUrl,
      })
      this.setState({
        books: [...this.state.books, newBook],
        newBookName: '',
        newBookAuthor: '',
        newBookReviewUrl: ''
      })
    } catch {
      alert('book creation failed')
    }
  }

  onBookDelete = async (bookId: string) => {
    try {
      await deleteBook(this.props.auth.getIdToken(), bookId)
      this.setState({
        books: this.state.books.filter(book => book.bookId != bookId)
      })
    } catch {
      alert('book deletion failed')
    }
  }

  onBookCheck = async (pos: number) => {
    try {
      const book = this.state.books[pos]
      await patchBook(this.props.auth.getIdToken(), book.bookId, {
        name: book.name,
        author: book.author,
        reviewUrl: book.reviewUrl,
        done: !book.done
      })
      this.setState({
        books: update(this.state.books, {
          [pos]: { done: { $set: !book.done } }
        })
      })
    } catch {
      alert('book update failed')
    }
  }

  async componentDidMount() {
    try {
      const books = await getBooks(this.props.auth.getIdToken())
      this.setState({
        books,
        loadingbooks: false
      })
    } catch (e) {
      alert(`Failed to fetch books: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1" style={{margin: "50px 0"}}>Your Favorite Books</Header>

        {this.renderCreateBookInput()}

        {this.renderBooks()}
      </div>
    )
  }

  renderCreateBookInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Header as="h3">Add New Favorite Book</Header>
          <Input
            style={{width: "600px"}}
            fluid
            placeholder="Book name"
            onChange={this.handleNameChange}
          />
          <Input
            style={{width: "600px"}}
            fluid
            placeholder="Book author"
            onChange={this.handleAuthorChange}
          />
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Save',
              onClick: this.onBookCreate
            }}
            style={{width: "600px"}}
            fluid
            placeholder="Book review URL"
            onChange={this.handleReviewUrlChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderBooks() {
    if (this.state.loadingbooks) {
      return this.renderLoading()
    }

    return this.renderBooksList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading BOOKs
        </Loader>
      </Grid.Row>
    )
  }

  renderBooksList() {
    return (
      <Grid padded>
        <Header as="h3" style={{margin: "50px 0 30px 0"}}>Favorite Books List</Header>
        {this.state.books.map((book, pos) => {
          return (
            <Grid.Row key={book.bookId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onBookCheck(pos)}
                  checked={book.done}
                />
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {book.name}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {book.author}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {book.reviewUrl}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(book.bookId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onBookDelete(book.bookId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {book.attachmentUrl && (
                <Image src={book.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
