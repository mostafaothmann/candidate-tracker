# README Notes

## Commitment to Guidelines
I committed to all the guidelines and conditions provided in the challenge.  
And beside that all pages were made fully responsive across all screen sizes, ensuring good usability on both desktop and mobile.

---

## 1. How to Run the Project

You can run the project exactly the same way described in the challenge instructions.

---

## 2. Non-Obvious Architectural Decisions

### Dashboard Charts

The documentation asks for:

- A bar chart of application counts grouped by status
- A doughnut chart showing the status distribution

To me, both charts were representing the same core concept (application statuses), so instead of creating two separate endpoints, I decided to create a single endpoint:

```txt
/dashboard/statusDistribution
```

This endpoint returns:

- each application status
- the count of applications for that status

Then:

- the bar chart displays the raw counts
- the doughnut chart displays percentages calculated from the same data

I thought this approach made more sense and avoided duplicated backend logic.

---

## 3. What I Would Improve or Finish Given More Time

1. Improve the UI and make the colors/design more visually attractive.

2. Add an authentication/login system for users of the application.

3. Extend candidate/application fields to support CV uploads.

4. Add more endpoint and integration tests.

5. Complete more bonus features instead of only implementing:
   - Optimistic updates on status change or delete
   - A Kanban board view grouped by application status

6. Add the Add Application Button with its View, It is easy and 
   I woked on search while typing before but there is no time .
---

## 4. Anything That Does Not Work / Potential Confusion

Technically, everything works correctly from my perspective.

However, I may have interpreted the dashboard chart requirements differently, especially regarding the status charts. Because of that, I implemented them in the way explained above in section (2).

---

# Additional Notes

## Dashboard

### Weekly Applications Chart

#### Note

The endpoint: /application/groupedByWeek

groups applications by week, where Sunday is considered the start of the week.

---

## Frontend

### Technical Decisions

I used Ant Design (https://ant.design/) as the component library because I already have good experience working with it, which helped speed up development.

---

## Dashboard UX Notes

### Rejection Rate Metric

I used:

```js
Number.toFixed(2);
```

to display the rejection rate with two decimal places.

This is mostly a UX choice and could vary depending on customer requirements.

---

### Status Distribution Chart

I used tooltips to display the exact count for each status instead of showing the numbers directly on the chart.

---

### Hired This Month Metric

The endpoint:

```txt
/dashboard/application/hiredThisMonth
```

retrieves applications whose status was updated to `HIRED` starting from the beginning of the current month.

This behavior is logically correct, but it may seem confusing when using seeded data because seeded records already contain pre-existing hired applications.

---

# General Notes / Known Issues

## Applications Per Week Chart

The requirement:

- A line chart of applications created per week over the last 8 weeks

Ideally should depend on the `created_at` field.

However, because the database is seeded using `seed.ts`, all rows end up with nearly the same `created_at` timestamp.

For that reason, I used the `applied_at` field instead to produce more realistic chart data.

In a real production environment, this would normally rely on `created_at`.
