import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

//material-ui
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: "#feefe6",
    marginTop: 40,
    height: "42vh",
    textAlign: "center",
  },
  innerCont: {
    margin: "34px 40px 40px 40px",
  },
  resources: {
    margin: "30px 40px 10px 40px",
  },
  buttonStyleOne: {
    color: "white",
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: "#f8bb13",
    },
  },
  buttonStyleTwo: {
    color: "white",
    backgroundColor: theme.palette.primary.main,
    marginLeft: 10,
    marginTop: 8,
    "&:hover": {
      backgroundColor: "#f8bb13",
    },
  },
}));

export default function Footer() {
  const { authenticated } = useSelector((state) => state.auth);
  const classes = useStyles();
  return (
    <Grid container direction="row" className={classes.container}>
      <Grid item xs={12} sm={4} className={classes.innerCont}>
        {authenticated ? (
          <Grid container direction="row">
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" component="p">
                Company
              </Typography>
              <Typography variant="body1" component="p">
                <br />
                About <br />
                Blog <br />
                Careers <br />
                Contact <br />
                Report Fraud <br />
                Report a bug <br />
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" component="p">
                For You
              </Typography>
              <Typography variant="body1" component="p">
                <br />
                Privacy <br />
                Terms <br />
                Security <br />
                Sitemap <br />
                Code of conduct <br />
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <>
            <Typography variant="h4" component="p">
            Tomato for Business
            </Typography>
            <Typography variant="body1" component="p" >
              Get more out of your business, without losing focus on what is
              most important — delighting your customers
            </Typography>
            <br />
            <Link to="/addrestaurant">
              <Button className={classes.buttonStyleOne}>Get Started</Button>
            </Link>
          </>
        )}
      </Grid>
      <Grid item xs={12} sm={3} className={classes.innerCont} >
        <Typography variant="h5" component="p">
        Tomato NewsLetter
        </Typography>
        <Typography variant="body1" component="p" style={{ marginBottom: 28 }}>
          Stay updated with new offers from Tomato
        </Typography>
        <TextField label="Your Email address" variant="outlined" />
        <Button className={classes.buttonStyleTwo}>SEND</Button>
      </Grid>
      <Grid item xs={12} sm={3} className={classes.resources}>
        <Typography variant="h5" component="p" align="left">
          Resources/Stack Used
        </Typography>
        <Typography variant="body1" component="p" style={{ marginBottom: 20, paddingLeft: 12 }} align="left">
          React Material UI Redux
          <br />
          NodeJs <br />
          Express <br />
          MongoDB Atlas <br />
          Zomato <br />
          Freepik <br />
        </Typography>
      </Grid>
    </Grid>
  );
}
