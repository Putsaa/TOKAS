import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Breadcrumbs, Typography, styled } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const BreadcrumbRoot = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
});

const BreadcrumbTitle = styled(Typography)(({ theme }) => ({
  margin: 0,
  fontSize: '1rem',
  fontWeight: 700,
  color: theme.palette.text.primary,
  textTransform: 'capitalize',
}));

const Separator = styled(Typography)(({ theme }) => ({
  margin: '0 10px',
  color: theme.palette.text.disabled,
  fontWeight: 300,
  fontSize: '1rem',
}));

const SubName = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  textTransform: 'capitalize',
  fontWeight: 500,
}));

const AppBreadcrumb = ({ routeSegments = [], title, action }) => {
  const activeTitle = title || (routeSegments.length ? routeSegments[routeSegments.length - 1].name : '');

  return (
    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
      <BreadcrumbRoot>
        {activeTitle && (
          <>
            <BreadcrumbTitle variant="h6">{activeTitle}</BreadcrumbTitle>
            <Separator component="span">|</Separator>
          </>
        )}
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: '0.95rem', color: 'text.disabled' }} />}
          aria-label="breadcrumb"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', color: '#2563eb' }}>
            <HomeIcon sx={{ fontSize: '1.2rem' }} color="primary" />
          </NavLink>

          {routeSegments.map((route, index) => {
            const isLast = index === routeSegments.length - 1;
            return !isLast && route.path ? (
              <NavLink key={index} to={route.path} style={{ textDecoration: 'none' }}>
                <SubName component="span" sx={{ '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                  {route.name}
                </SubName>
              </NavLink>
            ) : (
              <SubName key={index} component="span" sx={{ color: 'text.secondary' }}>
                {route.name}
              </SubName>
            );
          })}
        </Breadcrumbs>
      </BreadcrumbRoot>

      {action && <Box>{action}</Box>}
    </Box>
  );
};

export default memo(AppBreadcrumb);
