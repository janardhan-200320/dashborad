# 📊 Reports & Analytics Feature - Complete Guide

## Overview

The **Reports & Analytics** section provides comprehensive insights into your business performance with real-time data visualization, filtering, and export capabilities.

## 🎯 Key Features

### 1. **Multi-View Analytics Dashboard**
   - **Overview Tab**: Complete business snapshot with KPIs
   - **Bookings Tab**: Detailed booking analysis and patterns
   - **Revenue Tab**: Financial performance tracking
   - **Team Tab**: Individual team member performance
   - **Resources Tab**: Resource utilization metrics

### 2. **Dynamic Filters**
   - **Date Range Options**:
     - Last 7 days
     - Last 30 days (default)
     - Last 90 days
     - Custom date range
   
   - Real-time data updates when filters change

### 3. **Key Metrics Tracked**

#### Overview Metrics:
- ✅ **Total Bookings**: Complete count of all appointments
- 💰 **Total Revenue**: Sum of completed booking payments
- 📈 **Average Booking Value**: Revenue per completed booking
- ❌ **Cancellation Rate**: Percentage of cancelled bookings
- ⏰ **Upcoming Bookings**: Future scheduled appointments
- 👥 **Customer Stats**: New vs returning customers
- 📊 **Growth Indicators**: Comparison with previous period

#### Bookings Analysis:
- Completed vs Upcoming vs Cancelled breakdown
- Peak booking times (hourly distribution)
- Busiest days of the week
- Booking status completion rates

#### Revenue Analysis:
- Total revenue from completed bookings
- Pending revenue from upcoming bookings
- Top revenue-generating services
- Average booking value trends
- Revenue growth percentage

#### Team Performance:
- Individual booking counts
- Completion rates per team member
- Revenue contribution by member
- Cancellation statistics
- Performance rankings

#### Resource Utilization:
- Total booking hours per resource
- Revenue generated per resource
- Average hours per booking
- Resource efficiency metrics

### 4. **Report Generation**

Click **"New Report"** to access pre-built templates:

1. **Monthly Business Summary**
   - Complete overview of all metrics
   - Perfect for board meetings and stakeholders

2. **Revenue Analysis**
   - Detailed financial performance
   - Service-wise revenue breakdown
   - Growth trends and projections

3. **Team Performance**
   - Individual team member analytics
   - Booking completion rates
   - Revenue contributions

4. **Resource Utilization**
   - Room and equipment booking rates
   - Utilization efficiency
   - Underused resource identification

5. **Customer Insights**
   - New vs returning customer analysis
   - Retention rates
   - Customer satisfaction trends

6. **Service Analysis**
   - Most popular services
   - Demand patterns
   - Service revenue breakdown

### 5. **Export Options**

- **CSV Export**: Spreadsheet-ready data export
  - Includes all visible metrics
  - Service breakdown
  - Team performance data
  
- **PDF Export**: Professional report documents (coming soon)
- **Excel Export**: Advanced spreadsheet format (coming soon)

## 🚀 How to Use

### Basic Usage

1. **Navigate to Reports**
   - Go to Admin Center → Reports
   - Dashboard loads with last 30 days data by default

2. **Select Date Range**
   - Use the dropdown in the top-right
   - Choose from preset ranges or select custom dates
   - Data updates automatically

3. **Switch Between Views**
   - Click tabs: Overview | Bookings | Revenue | Team | Resources
   - Each view shows specialized metrics

4. **Export Data**
   - Click "Export CSV" to download current view
   - Includes all metrics and breakdowns

### Creating Custom Reports

1. Click **"New Report"** button
2. Select a report template
3. Configure:
   - Date range for the report
   - Export format (PDF/CSV/Excel)
4. Click **"Generate Report"**
5. Report is created and ready to download

## 📈 Understanding the Data

### KPI Cards (Overview Tab)

Each metric card shows:
- **Current Value**: The metric for selected period
- **Growth Indicator**: ↑ or ↓ compared to previous period
- **Context**: Additional information about the metric

**Color Coding:**
- 🟣 Purple: Booking-related metrics
- 🟢 Green: Revenue and success metrics
- 🔵 Blue: Performance indicators
- 🔴 Red: Warning metrics (cancellations)
- 🟠 Orange: Pending/upcoming items

### Charts and Visualizations

1. **Day of Week Distribution**
   - Shows which days are busiest
   - Helps optimize staff scheduling
   - Identifies slow days for promotions

2. **Peak Times Chart**
   - Hour-by-hour booking patterns
   - Identify busiest hours
   - Optimize resource allocation

3. **Customer Breakdown**
   - New vs Returning customer ratio
   - Retention rate visualization
   - Customer growth trends

4. **Service Revenue Bars**
   - Compare revenue across services
   - Identify top performers
   - Spot underperforming offerings

### Team Performance Table

**Columns Explained:**
- **Total Bookings**: All appointments assigned
- **Completed**: Successfully finished appointments
- **Cancelled**: Appointments that were cancelled
- **Revenue**: Total earnings from their bookings
- **Completion Rate**: % of bookings completed (color-coded)
  - 🟢 Green: 90%+ (excellent)
  - 🟡 Yellow: 70-89% (good)
  - 🔴 Red: <70% (needs attention)

**Rankings:**
- 🥇 Gold badge: #1 performer
- 🥈 Silver badge: #2 performer
- 🥉 Bronze badge: #3 performer

### Resource Utilization Table

**Metrics:**
- **Total Bookings**: Number of times resource was booked
- **Total Hours**: Cumulative booking duration
- **Revenue**: Income generated from resource bookings
- **Avg Hours/Booking**: Typical booking length

## 💡 Business Insights

### Key Questions Answered:

1. **"How is my business performing?"**
   - Check Overview tab for complete snapshot
   - Look at growth indicators (green = good, red = needs attention)

2. **"Which services make the most money?"**
   - Revenue tab → Top Revenue Services chart
   - Sort by revenue to see winners

3. **"Who are my top performers?"**
   - Team tab → Performance table
   - #1 ranked team member shown with gold badge

4. **"When should I schedule more staff?"**
   - Bookings tab → Peak Booking Times
   - Shows busiest hours and days

5. **"Are customers coming back?"**
   - Overview tab → Customer Breakdown
   - High retention rate = happy customers

6. **"Are resources being utilized efficiently?"**
   - Resources tab → Utilization table
   - Low hours = underused, high hours = popular

7. **"What's my cancellation problem?"**
   - Overview → Cancellation Rate card
   - If >15%, investigate reasons

## 🎨 Visual Guide

### Color-Coded Status Badges:
- 🟢 **Completed**: Successfully finished
- 🟠 **Upcoming**: Scheduled for future
- 🔴 **Cancelled**: Booking cancelled

### Growth Indicators:
- ↑ **Green arrow + %**: Positive growth
- ↓ **Red arrow + %**: Decline (needs attention)

## 🔧 Technical Details

### API Endpoint
```
GET /api/reports/analytics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

### Data Sources
- **Appointments**: From `/api/appointments`
- **Resource Bookings**: From `/api/resource-bookings`
- **Invoices**: From localStorage (future: database)

### Calculations

**Revenue Growth:**
```
((Current Revenue - Previous Revenue) / Previous Revenue) × 100
```

**Completion Rate:**
```
(Completed Bookings / Total Bookings) × 100
```

**Customer Retention:**
```
(Returning Customers / Total Customers) × 100
```

**Average Booking Value:**
```
Total Revenue / Completed Bookings
```

## 📊 Sample Data for Testing

To test the Reports feature with sample data:

1. Open `scripts/populate-test-data.html` in your browser
2. Make sure the server is running (`npm run dev`)
3. Click **"Populate Test Data"** button
4. Wait for data creation to complete
5. Click **"View Reports Page"** to see the results

This creates:
- 50 appointments (70% completed, 20% upcoming, 10% cancelled)
- 5 resources (rooms, equipment, vehicles)
- 30 resource bookings
- Distributed across last 90 days

## 🐛 Troubleshooting

### "No data showing"
- Check date range filter
- Ensure appointments/bookings exist in that period
- Try "Last 90 days" range

### "Analytics not loading"
- Verify server is running on port 5001
- Check browser console for errors
- Ensure API endpoint is accessible

### "Export not working"
- Check browser allows downloads
- Ensure data is loaded first
- Try refreshing the page

## 🚀 Future Enhancements

Planned features:
- [ ] PDF report generation with charts
- [ ] Email report scheduling
- [ ] Custom report builder with drag-drop
- [ ] Revenue forecasting with AI
- [ ] Comparative period analysis
- [ ] Dashboard widgets customization
- [ ] Real-time notifications for milestones
- [ ] Integration with accounting software

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify all data sources are accessible
3. Ensure server is running on correct port
4. Review filter settings

---

**Pro Tip**: Set up a weekly report generation routine every Monday to track your business performance consistently! 📈

