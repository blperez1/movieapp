import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Amplify, { API,graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react'; 
import aws_exports from './aws-exports'; // specify the location of aws-exports.js file on your project
Amplify.configure(aws_exports);

const createMovie = `mutation createMovie($movie: String!){
  createMovie(input:{
    movie: $movie
  }){
    __typename
    id
    title
    description
  }
}`;

const readMovie = `query listMovie{
  listMovie{
    items{
      __typename
      id
      title
      description
    }
  }
}`;

const updateMovie = `mutation updateMovie($id: ID!,$movie: String){
  updateNote(input:{
    id: $id
    title: $title
    description: $description
  }){
    __typename
    id
    title
    description
  }
}`;

const deleteMovie = `mutation deleteMovie($id: ID!){
  deleteMovie(input:{
    id: $id
  }){
    __typename
    id
    title
    description
  }
}`;

class App extends Component {
  constructor(props){
    super(props);
    this.state={
      id:"",
      movies:[],
      value: "",
      description:"",
      displayAdd:true,
      displayUpdate:false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  async componentDidMount(){
    const movies = await API.graphql(graphqlOperation(readMovie));
    this.setState({Movies: movies.data.listMovies.items});
  }

  handleChange(event) {
    this.setState({value:event.target.value});
  }
  async handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const movie = {"movie":this.state.value}
    await API.graphql(graphqlOperation(createMovie, movie));
    this.listMovies();
    this.setState({value:""});
  }
  async handleDelete(id) {
    const movieId = {"id":id};
    await API.graphql(graphqlOperation(deleteMovie, movieId));
    this.listMovies();
  }
  async handleUpdate(event) {
    event.preventDefault();
    event.stopPropagation();
    const movie = {"id":this.state.id,"movie":this.state.value};
    await API.graphql(graphqlOperation(updateMovie, movie));
    this.listMovies();
    this.setState({displayAdd:true,displayUpdate:false,value:""});
  }
  selectMovie(movie){
    this.setState({id:movie.id,value:movie.movie,displayAdd:false,displayUpdate:true});
  }
  async listMovies(){
    const movies = await API.graphql(graphqlOperation(readMovie));
    this.setState({notes:movies.data.listMovies.items});
  }
  
  render() {
    const data = [].concat(this.state.movies)
      .map((item,i)=> 
      <div className="alert alert-primary alert-dismissible show" role="alert">
        <span key={item.i} onClick={this.selectMovie.bind(this, item)}>{item.movie}</span>
        <button key={item.i} type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={this.handleDelete.bind(this, item.id)}>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      )
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Movies App</h1>
        </header>
        <br/>
        <div className="container">
          {this.state.displayAdd ?
            <form onSubmit={this.handleSubmit}>
              <div className="input-group mb-3">
                <input type="text" className="form-control form-control-lg" placeholder="New Note" aria-label="Note" aria-describedby="basic-addon2" value={this.state.value} onChange={this.handleChange}/>
                <div className="input-group-append">
                  <button className="btn btn-primary" type="submit">Add movie</button>
                </div>
              </div>
            </form>
          : null }
          {this.state.displayUpdate ?
            <form onSubmit={this.handleUpdate}>
              <div className="input-group mb-3">
                <input type="text" className="form-control form-control-lg" placeholder="Update Note" aria-label="Note" aria-describedby="basic-addon2" value={this.state.value} onChange={this.handleChange}/>
                <div className="input-group-append">
                  <button className="btn btn-primary" type="submit">Update Movie</button>
                </div>
              </div>
            </form>
          : null }
        </div>
        <br/>
        <div className="container">
          {data}
        </div>
      </div>
    );
  }
}
export default withAuthenticator(App, { includeGreetings: true });
