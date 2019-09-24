import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { Link } from "gatsby"
import Header from "../components/header"
const logo = require('../images/2017_PO_header_gray.png');

const ListLink = props => (
  <li style={{ display: `inline-block`, marginRight: `1rem` }}>
    <Link to={props.to}>{props.children}</Link>
  </li>
)

export default ({ children }) => {
  const dataLayout = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  )
  return(
    <div>
      
     
      <Link to="/" style={{ textShadow: `none`, backgroundImage: `none` }}>
      <Header headerText ="Public Comment Lottery"/>
        </Link>
        <ul style={{ listStyle: `none`, float: `right` }}>
          <ListLink to="/queue">View Queue</ListLink>
          {/* <ListLink to="/about/">About</ListLink>
          <ListLink to="/contact/">Contact</ListLink> */}
        </ul>
      {children}
      <footer>
        <img src={logo} />
        <p>Copyright &copy; 2019 <a href='https://www.enviroissues.com' target='_blank'>EnviroIssues</a></p>
        </footer>
    </div>
  )
}

