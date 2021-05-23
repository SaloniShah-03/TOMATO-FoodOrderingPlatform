import React from "react";

//material-ui
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

import cover from "../images/delivery-man.png";

const useStyles = makeStyles((theme) => ({
  presentation: {
    display: "flex",
    width: "90%",
    margin: "auto",
    minHeight: "80vh",
    alignItems: "center",
    // eslint-disable-next-line
    ["@media (max-width:1024px)"]: {
      flexDirection: "column",
    },
  },
  introduction: {
    flex: 1,
    paddingLeft: 60,
    height: "300px",
  },
  safeFood: {
    fontSize: 64,
    fontWeight: 400,
  },
  delivery: {
    color: "#157a21",
    fontSize: 64,
    fontWeight: "bold",
    marginTop: -30,
    marginBottom: 20,
  },
  paragraph: {
    width: 400,
    fontSize: 15,
    justifyContent: "right"
  },
  cover: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    height: "72vh",
    marginTop: 30,
  },
  coverImg: {
    height: "100%",
    marginRight: 10,
  },
  ctaOrder: {
    fontSize: 18,
    backgroundColor: "#ea421b",
    marginTop: 30,
    color: "#ffffff",
    "&:hover": {
      backgroundColor: "#f8bb13",
    },
  },
}));

const HomeStart = () => {
  const classes = useStyles();
  return (
    <section className={classes.presentation}>
      <div className={classes.introduction}>
        <Typography className={classes.safeFood} noWrap>
          Safe Food
        </Typography>
        <Typography className={classes.delivery} noWrap>
          DELIVERY
        </Typography>
        <Typography variant="body2" className={classes.paragraph}>
          Tomato is an Indian restaurant aggregator and food delivery start-up.
          Tomato provides information and menus of restaurants as well as food
          delivery options from partner restaurants in select cities.
        </Typography>
        <Button variant="outlined" className={classes.ctaOrder}>
          ORDER NOW
        </Button>
      </div>
      <div className={classes.cover}>
        <img src={cover} alt="safe-delivery" className={classes.coverImg} />
      </div>
    </section>
  );
};

export default React.memo(HomeStart);
